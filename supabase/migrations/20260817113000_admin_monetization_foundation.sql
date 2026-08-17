begin;

create extension if not exists pgcrypto;

create table if not exists public.admin_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'owner', 'support')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  billing_type text not null check (billing_type in ('subscription', 'one_time')),
  price_amount bigint not null check (price_amount >= 0),
  currency text not null default 'IDR',
  generation_quota integer,
  interval_unit text check (interval_unit in ('month', 'year') or interval_unit is null),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (billing_type = 'subscription' and interval_unit is not null)
    or (billing_type = 'one_time' and interval_unit is null)
  )
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  provider text not null,
  provider_subscription_id text,
  status text not null check (status in ('pending', 'active', 'past_due', 'cancelled', 'expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.plans(id),
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text not null,
  provider_payment_id text,
  kind text not null check (kind in ('subscription', 'one_time')),
  amount bigint not null check (amount >= 0),
  currency text not null default 'IDR',
  status text not null check (status in ('pending', 'paid', 'failed', 'expired', 'refunded')),
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);

create table if not exists public.generation_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_payment_id uuid references public.payments(id) on delete set null,
  source text not null check (source in ('trial', 'one_time', 'subscription', 'manual')),
  total_uses integer not null default 1 check (total_uses > 0),
  used_uses integer not null default 0 check (used_uses >= 0),
  status text not null default 'active' check (status in ('active', 'consumed', 'expired', 'revoked')),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (used_uses <= total_uses)
);

create table if not exists public.generation_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_id uuid references public.generation_entitlements(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  source text not null check (source in ('trial', 'one_time', 'subscription')),
  idempotency_key text not null,
  generation_reference text,
  model text,
  input_tokens bigint,
  output_tokens bigint,
  estimated_cost_amount bigint,
  currency text not null default 'IDR',
  status text not null default 'completed' check (status in ('started', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  processing_error text,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_members
    where user_id = auth.uid()
      and is_active = true
  );
$$;

create or replace function public.consume_one_time_generation(
  p_idempotency_key text,
  p_generation_reference text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_entitlement_id uuid;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select entitlement_id
    into v_entitlement_id
  from public.generation_usage
  where user_id = v_user_id
    and idempotency_key = p_idempotency_key
  limit 1;

  if found then
    return v_entitlement_id;
  end if;

  select id
    into v_entitlement_id
  from public.generation_entitlements
  where user_id = v_user_id
    and source = 'one_time'
    and status = 'active'
    and used_uses < total_uses
    and (expires_at is null or expires_at > now())
  order by expires_at asc nulls last, created_at asc
  for update skip locked
  limit 1;

  if v_entitlement_id is null then
    return null;
  end if;

  update public.generation_entitlements
  set used_uses = used_uses + 1,
      status = case when used_uses + 1 >= total_uses then 'consumed' else 'active' end,
      updated_at = now()
  where id = v_entitlement_id;

  insert into public.generation_usage (
    user_id,
    entitlement_id,
    source,
    idempotency_key,
    generation_reference,
    status
  ) values (
    v_user_id,
    v_entitlement_id,
    'one_time',
    p_idempotency_key,
    p_generation_reference,
    'started'
  );

  return v_entitlement_id;
end;
$$;

create index if not exists idx_subscriptions_user_status on public.subscriptions(user_id, status);
create index if not exists idx_payments_user_created on public.payments(user_id, created_at desc);
create index if not exists idx_payments_status_created on public.payments(status, created_at desc);
create index if not exists idx_entitlements_user_status on public.generation_entitlements(user_id, status);
create index if not exists idx_usage_user_created on public.generation_usage(user_id, created_at desc);
create index if not exists idx_usage_created on public.generation_usage(created_at desc);

alter table public.admin_members enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.generation_entitlements enable row level security;
alter table public.generation_usage enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.admin_audit_logs enable row level security;

create policy "admin_members_read_self" on public.admin_members
for select to authenticated
using (user_id = auth.uid());

create policy "plans_read_active" on public.plans
for select to authenticated
using (is_active = true or public.is_admin());

create policy "subscriptions_read_own_or_admin" on public.subscriptions
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "payments_read_own_or_admin" on public.payments
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "entitlements_read_own_or_admin" on public.generation_entitlements
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "usage_read_own_or_admin" on public.generation_usage
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "webhook_events_admin_read" on public.payment_webhook_events
for select to authenticated
using (public.is_admin());

create policy "audit_logs_admin_read" on public.admin_audit_logs
for select to authenticated
using (public.is_admin());

create trigger admin_members_updated_at
before update on public.admin_members
for each row execute function public.set_updated_at();

create trigger plans_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

create trigger subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create trigger payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger entitlements_updated_at
before update on public.generation_entitlements
for each row execute function public.set_updated_at();

commit;
