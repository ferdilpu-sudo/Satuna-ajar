begin;

create index if not exists idx_usage_subscription_period
  on public.generation_usage(subscription_id, created_at desc)
  where source = 'subscription';

create or replace function public.reserve_paid_generation(
  p_idempotency_key text,
  p_generation_reference text default null
)
returns table (
  access_source text,
  reserved_entitlement_id uuid,
  reserved_subscription_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing public.generation_usage%rowtype;
  v_entitlement public.generation_entitlements%rowtype;
  v_subscription_id uuid;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_generation_quota integer;
  v_subscription_used bigint;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if coalesce(trim(p_idempotency_key), '') = '' then
    raise exception 'IDEMPOTENCY_KEY_REQUIRED';
  end if;

  select *
    into v_existing
  from public.generation_usage
  where user_id = v_user_id
    and idempotency_key = p_idempotency_key
  limit 1;

  if found then
    if v_existing.status = 'started' then
      return query
      select v_existing.source, v_existing.entitlement_id, v_existing.subscription_id;
      return;
    end if;

    if v_existing.status = 'completed' then
      raise exception 'GENERATION_ATTEMPT_ALREADY_COMPLETED';
    end if;

    raise exception 'GENERATION_ATTEMPT_ALREADY_FAILED';
  end if;

  select *
    into v_entitlement
  from public.generation_entitlements
  where user_id = v_user_id
    and source = 'one_time'
    and status = 'active'
    and used_uses < total_uses
    and (expires_at is null or expires_at > now())
  order by expires_at asc nulls last, created_at asc
  for update
  limit 1;

  if found then
    update public.generation_entitlements
    set used_uses = used_uses + 1,
        status = case when used_uses + 1 >= total_uses then 'consumed' else 'active' end,
        updated_at = now()
    where id = v_entitlement.id;

    insert into public.generation_usage (
      user_id,
      entitlement_id,
      source,
      idempotency_key,
      generation_reference,
      status
    ) values (
      v_user_id,
      v_entitlement.id,
      'one_time',
      p_idempotency_key,
      p_generation_reference,
      'started'
    );

    return query select 'one_time'::text, v_entitlement.id, null::uuid;
    return;
  end if;

  select s.id,
         s.current_period_start,
         s.current_period_end,
         p.generation_quota
    into v_subscription_id,
         v_period_start,
         v_period_end,
         v_generation_quota
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.user_id = v_user_id
    and s.status = 'active'
    and s.current_period_start is not null
    and s.current_period_end is not null
    and s.current_period_end > now()
    and coalesce(p.generation_quota, 0) > 0
  order by s.current_period_end desc
  for update of s
  limit 1;

  if v_subscription_id is null then
    return;
  end if;

  select count(*)
    into v_subscription_used
  from public.generation_usage
  where user_id = v_user_id
    and subscription_id = v_subscription_id
    and source = 'subscription'
    and status in ('started', 'completed')
    and created_at >= v_period_start
    and created_at < v_period_end;

  if v_subscription_used >= v_generation_quota then
    return;
  end if;

  insert into public.generation_usage (
    user_id,
    subscription_id,
    source,
    idempotency_key,
    generation_reference,
    status
  ) values (
    v_user_id,
    v_subscription_id,
    'subscription',
    p_idempotency_key,
    p_generation_reference,
    'started'
  );

  return query select 'subscription'::text, null::uuid, v_subscription_id;
end;
$$;

revoke all on function public.reserve_paid_generation(text, text) from public;
grant execute on function public.reserve_paid_generation(text, text) to authenticated;

create or replace function public.finalize_paid_generation(
  p_idempotency_key text,
  p_success boolean,
  p_model text default null,
  p_input_tokens bigint default null,
  p_output_tokens bigint default null,
  p_estimated_cost_amount bigint default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_usage public.generation_usage%rowtype;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select *
    into v_usage
  from public.generation_usage
  where user_id = v_user_id
    and idempotency_key = p_idempotency_key
    and source in ('one_time', 'subscription')
  for update;

  if not found then
    return false;
  end if;

  if v_usage.status in ('completed', 'failed') then
    return true;
  end if;

  if p_success then
    update public.generation_usage
    set status = 'completed',
        model = coalesce(p_model, model),
        input_tokens = coalesce(p_input_tokens, input_tokens),
        output_tokens = coalesce(p_output_tokens, output_tokens),
        estimated_cost_amount = coalesce(p_estimated_cost_amount, estimated_cost_amount)
    where id = v_usage.id;

    return true;
  end if;

  if v_usage.source = 'one_time' and v_usage.entitlement_id is not null then
    update public.generation_entitlements
    set used_uses = greatest(used_uses - 1, 0),
        status = case
          when expires_at is not null and expires_at <= now() then 'expired'
          else 'active'
        end,
        updated_at = now()
    where id = v_usage.entitlement_id;
  end if;

  update public.generation_usage
  set status = 'failed',
      model = coalesce(p_model, model),
      input_tokens = coalesce(p_input_tokens, input_tokens),
      output_tokens = coalesce(p_output_tokens, output_tokens),
      estimated_cost_amount = coalesce(p_estimated_cost_amount, estimated_cost_amount)
  where id = v_usage.id;

  return true;
end;
$$;

revoke all on function public.finalize_paid_generation(text, boolean, text, bigint, bigint, bigint) from public;
grant execute on function public.finalize_paid_generation(text, boolean, text, bigint, bigint, bigint) to authenticated;

commit;
