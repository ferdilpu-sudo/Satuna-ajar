begin;

create table if not exists public.checkout_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  provider text check (provider in ('ipaymu', 'midtrans') or provider is null),
  provider_reference text,
  status text not null default 'created' check (status in ('created', 'pending', 'paid', 'failed', 'expired', 'cancelled', 'refunded')),
  amount bigint not null check (amount >= 0),
  currency text not null default 'IDR',
  idempotency_key text not null,
  checkout_url text,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key),
  unique (provider, provider_reference)
);

alter table public.payments
  add column if not exists checkout_order_id uuid references public.checkout_orders(id) on delete set null;

alter table public.subscriptions
  add column if not exists checkout_order_id uuid references public.checkout_orders(id) on delete set null;

create unique index if not exists uq_payments_checkout_order
  on public.payments(checkout_order_id)
  where checkout_order_id is not null;

create unique index if not exists uq_subscriptions_checkout_order
  on public.subscriptions(checkout_order_id)
  where checkout_order_id is not null;

create unique index if not exists uq_one_time_entitlement_payment
  on public.generation_entitlements(source_payment_id)
  where source = 'one_time' and source_payment_id is not null;

create index if not exists idx_checkout_orders_user_created
  on public.checkout_orders(user_id, created_at desc);

create index if not exists idx_checkout_orders_status_created
  on public.checkout_orders(status, created_at desc);

alter table public.checkout_orders enable row level security;

drop policy if exists "plans_read_active" on public.plans;
create policy "plans_read_active" on public.plans
for select to anon, authenticated
using (is_active = true or public.is_admin());

create policy "checkout_orders_read_own_or_admin" on public.checkout_orders
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

revoke insert, update, delete on public.checkout_orders from anon, authenticated;
grant select on public.checkout_orders to authenticated;

create trigger checkout_orders_updated_at
before update on public.checkout_orders
for each row execute function public.set_updated_at();

create or replace function public.create_checkout_order(
  p_plan_code text,
  p_idempotency_key text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan_id uuid;
  v_price_amount bigint;
  v_currency text;
  v_order_id uuid;
  v_existing_plan_id uuid;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if coalesce(trim(p_idempotency_key), '') = '' then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED';
  end if;

  select id, price_amount, currency
    into v_plan_id, v_price_amount, v_currency
  from public.plans
  where code = p_plan_code
    and is_active = true
  limit 1;

  if v_plan_id is null then
    raise exception 'PLAN_NOT_FOUND';
  end if;

  select id, plan_id
    into v_order_id, v_existing_plan_id
  from public.checkout_orders
  where user_id = v_user_id
    and idempotency_key = p_idempotency_key
  limit 1;

  if v_order_id is not null then
    if v_existing_plan_id <> v_plan_id then
      raise exception 'IDEMPOTENCY_KEY_CONFLICT';
    end if;
    return v_order_id;
  end if;

  insert into public.checkout_orders (
    user_id,
    plan_id,
    amount,
    currency,
    idempotency_key
  ) values (
    v_user_id,
    v_plan_id,
    v_price_amount,
    v_currency,
    p_idempotency_key
  )
  on conflict (user_id, idempotency_key) do nothing
  returning id into v_order_id;

  if v_order_id is null then
    select id, plan_id
      into v_order_id, v_existing_plan_id
    from public.checkout_orders
    where user_id = v_user_id
      and idempotency_key = p_idempotency_key
    limit 1;

    if v_existing_plan_id <> v_plan_id then
      raise exception 'IDEMPOTENCY_KEY_CONFLICT';
    end if;
  end if;

  return v_order_id;
end;
$$;

revoke all on function public.create_checkout_order(text, text) from public;
grant execute on function public.create_checkout_order(text, text) to authenticated;

create or replace function public.assign_checkout_provider(
  p_order_id uuid,
  p_provider text,
  p_provider_reference text,
  p_checkout_url text,
  p_expires_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated_id uuid;
begin
  if p_provider not in ('ipaymu', 'midtrans') then
    raise exception 'UNSUPPORTED_PAYMENT_PROVIDER';
  end if;

  if coalesce(trim(p_provider_reference), '') = '' or coalesce(trim(p_checkout_url), '') = '' then
    raise exception 'INVALID_PROVIDER_CHECKOUT';
  end if;

  update public.checkout_orders
  set provider = p_provider,
      provider_reference = p_provider_reference,
      checkout_url = p_checkout_url,
      expires_at = p_expires_at,
      status = 'pending',
      updated_at = now()
  where id = p_order_id
    and status in ('created', 'pending')
    and (provider is null or provider = p_provider)
    and (provider_reference is null or provider_reference = p_provider_reference)
  returning id into v_updated_id;

  if v_updated_id is null then
    raise exception 'CHECKOUT_ORDER_STATE_CONFLICT';
  end if;
end;
$$;

revoke all on function public.assign_checkout_provider(uuid, text, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.assign_checkout_provider(uuid, text, text, text, timestamptz) to service_role;

create or replace function public.finalize_checkout_payment(
  p_order_id uuid,
  p_provider text,
  p_provider_event_id text,
  p_event_type text,
  p_provider_payment_id text,
  p_payment_status text,
  p_amount bigint,
  p_currency text,
  p_payload jsonb default '{}'::jsonb,
  p_paid_at timestamptz default null,
  p_provider_subscription_id text default null,
  p_period_start timestamptz default null,
  p_period_end timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_event_processed_at timestamptz;
  v_user_id uuid;
  v_plan_id uuid;
  v_order_provider text;
  v_order_amount bigint;
  v_order_currency text;
  v_billing_type text;
  v_generation_quota integer;
  v_interval_unit text;
  v_existing_payment_id uuid;
  v_existing_order_id uuid;
  v_existing_status text;
  v_effective_status text;
  v_payment_id uuid;
  v_subscription_id uuid;
  v_effective_period_start timestamptz;
  v_effective_period_end timestamptz;
begin
  if p_provider not in ('ipaymu', 'midtrans') then
    raise exception 'UNSUPPORTED_PAYMENT_PROVIDER';
  end if;

  if coalesce(trim(p_provider_event_id), '') = '' or coalesce(trim(p_provider_payment_id), '') = '' then
    raise exception 'INVALID_PROVIDER_EVENT';
  end if;

  if p_payment_status not in ('pending', 'paid', 'failed', 'expired', 'refunded') then
    raise exception 'INVALID_PAYMENT_STATUS';
  end if;

  insert into public.payment_webhook_events (
    provider,
    provider_event_id,
    event_type,
    payload
  ) values (
    p_provider,
    p_provider_event_id,
    p_event_type,
    coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (provider, provider_event_id) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select id, processed_at
      into v_event_id, v_event_processed_at
    from public.payment_webhook_events
    where provider = p_provider
      and provider_event_id = p_provider_event_id
    limit 1;

    if v_event_processed_at is not null then
      select id
        into v_payment_id
      from public.payments
      where provider = p_provider
        and provider_payment_id = p_provider_payment_id
      limit 1;
      return v_payment_id;
    end if;
  end if;

  select o.user_id,
         o.plan_id,
         o.provider,
         o.amount,
         o.currency,
         p.billing_type,
         p.generation_quota,
         p.interval_unit
    into v_user_id,
         v_plan_id,
         v_order_provider,
         v_order_amount,
         v_order_currency,
         v_billing_type,
         v_generation_quota,
         v_interval_unit
  from public.checkout_orders o
  join public.plans p on p.id = o.plan_id
  where o.id = p_order_id
  for update of o;

  if v_user_id is null then
    raise exception 'CHECKOUT_ORDER_NOT_FOUND';
  end if;

  if v_order_provider is distinct from p_provider then
    raise exception 'PAYMENT_PROVIDER_MISMATCH';
  end if;

  if v_order_amount <> p_amount or upper(v_order_currency) <> upper(p_currency) then
    raise exception 'PAYMENT_AMOUNT_MISMATCH';
  end if;

  select id, checkout_order_id, status
    into v_existing_payment_id, v_existing_order_id, v_existing_status
  from public.payments
  where provider = p_provider
    and provider_payment_id = p_provider_payment_id
  limit 1;

  if v_existing_payment_id is not null and v_existing_order_id is distinct from p_order_id then
    raise exception 'PAYMENT_REFERENCE_CONFLICT';
  end if;

  v_effective_status := p_payment_status;
  if v_existing_status = 'refunded' then
    v_effective_status := 'refunded';
  elsif v_existing_status = 'paid' and p_payment_status <> 'refunded' then
    v_effective_status := 'paid';
  end if;

  insert into public.payments (
    user_id,
    plan_id,
    checkout_order_id,
    provider,
    provider_payment_id,
    kind,
    amount,
    currency,
    status,
    paid_at,
    metadata
  ) values (
    v_user_id,
    v_plan_id,
    p_order_id,
    p_provider,
    p_provider_payment_id,
    v_billing_type,
    p_amount,
    upper(p_currency),
    v_effective_status,
    case when v_effective_status in ('paid', 'refunded') then coalesce(p_paid_at, now()) else null end,
    jsonb_build_object('last_event_type', p_event_type)
  )
  on conflict (provider, provider_payment_id)
  do update set
    status = excluded.status,
    paid_at = coalesce(public.payments.paid_at, excluded.paid_at),
    metadata = public.payments.metadata || excluded.metadata,
    updated_at = now()
  returning id into v_payment_id;

  update public.checkout_orders
  set status = case
        when v_effective_status = 'paid' then 'paid'
        when v_effective_status = 'refunded' then 'refunded'
        when v_effective_status = 'failed' then 'failed'
        when v_effective_status = 'expired' then 'expired'
        else 'pending'
      end,
      updated_at = now()
  where id = p_order_id;

  if v_effective_status = 'paid' then
    if v_billing_type = 'one_time' then
      if coalesce(v_generation_quota, 0) <= 0 then
        raise exception 'PLAN_GENERATION_QUOTA_REQUIRED';
      end if;

      insert into public.generation_entitlements (
        user_id,
        source_payment_id,
        source,
        total_uses,
        used_uses,
        status
      ) values (
        v_user_id,
        v_payment_id,
        'one_time',
        v_generation_quota,
        0,
        'active'
      )
      on conflict (source_payment_id)
        where source = 'one_time' and source_payment_id is not null
      do nothing;
    elsif v_billing_type = 'subscription' then
      v_effective_period_start := coalesce(p_period_start, p_paid_at, now());
      v_effective_period_end := p_period_end;

      if v_effective_period_end is null then
        if v_interval_unit = 'month' then
          v_effective_period_end := v_effective_period_start + interval '1 month';
        elsif v_interval_unit = 'year' then
          v_effective_period_end := v_effective_period_start + interval '1 year';
        else
          raise exception 'SUBSCRIPTION_INTERVAL_REQUIRED';
        end if;
      end if;

      insert into public.subscriptions (
        user_id,
        plan_id,
        checkout_order_id,
        provider,
        provider_subscription_id,
        status,
        current_period_start,
        current_period_end
      ) values (
        v_user_id,
        v_plan_id,
        p_order_id,
        p_provider,
        coalesce(nullif(p_provider_subscription_id, ''), p_provider_payment_id),
        'active',
        v_effective_period_start,
        v_effective_period_end
      )
      on conflict (checkout_order_id)
        where checkout_order_id is not null
      do update set
        provider_subscription_id = excluded.provider_subscription_id,
        status = 'active',
        current_period_start = excluded.current_period_start,
        current_period_end = excluded.current_period_end,
        updated_at = now()
      returning id into v_subscription_id;

      update public.payments
      set subscription_id = v_subscription_id,
          updated_at = now()
      where id = v_payment_id;
    end if;
  elsif v_effective_status = 'refunded' then
    update public.generation_entitlements
    set status = 'revoked',
        updated_at = now()
    where source_payment_id = v_payment_id
      and source = 'one_time'
      and status <> 'revoked';

    update public.subscriptions
    set status = 'cancelled',
        cancelled_at = coalesce(cancelled_at, now()),
        updated_at = now()
    where checkout_order_id = p_order_id
      and status <> 'cancelled';
  end if;

  update public.payment_webhook_events
  set processed_at = now(),
      processing_error = null
  where id = v_event_id;

  return v_payment_id;
end;
$$;

revoke all on function public.finalize_checkout_payment(uuid, text, text, text, text, text, bigint, text, jsonb, timestamptz, text, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.finalize_checkout_payment(uuid, text, text, text, text, text, bigint, text, jsonb, timestamptz, text, timestamptz, timestamptz) to service_role;

commit;
