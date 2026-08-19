begin;

create or replace function public.finalize_one_time_generation(
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

  if v_usage.entitlement_id is not null then
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

revoke all on function public.finalize_one_time_generation(text, boolean, text, bigint, bigint, bigint) from public;
grant execute on function public.finalize_one_time_generation(text, boolean, text, bigint, bigint, bigint) to authenticated;

commit;
