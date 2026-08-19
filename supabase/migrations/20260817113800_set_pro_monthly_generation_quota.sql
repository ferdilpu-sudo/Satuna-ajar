begin;

do $$
begin
  update public.plans
  set generation_quota = 20,
      updated_at = now()
  where code = 'pro-monthly'
    and billing_type = 'subscription';

  if not found then
    raise exception 'PRO_MONTHLY_PLAN_NOT_FOUND';
  end if;
end;
$$;

commit;
