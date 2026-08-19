begin;

create or replace function public.admin_overview_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total_users bigint;
  v_active_subscriptions bigint;
  v_month_revenue bigint;
  v_month_one_time_revenue bigint;
  v_mrr bigint;
  v_generations_30d bigint;
  v_failed_generations_30d bigint;
  v_ai_cost_30d bigint;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  select count(*)
    into v_total_users
  from auth.users u
  where not exists (
    select 1
    from public.admin_members am
    where am.user_id = u.id
      and am.is_active = true
  );

  select count(*)
    into v_active_subscriptions
  from public.subscriptions
  where status = 'active'
    and (current_period_end is null or current_period_end > now());

  select coalesce(sum(amount), 0)
    into v_month_revenue
  from public.payments
  where status = 'paid'
    and paid_at >= date_trunc('month', now());

  select coalesce(sum(amount), 0)
    into v_month_one_time_revenue
  from public.payments
  where status = 'paid'
    and kind = 'one_time'
    and paid_at >= date_trunc('month', now());

  select coalesce(sum(
    case
      when p.interval_unit = 'month' then p.price_amount
      when p.interval_unit = 'year' then round(p.price_amount / 12.0)::bigint
      else 0
    end
  ), 0)
    into v_mrr
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.status = 'active'
    and (s.current_period_end is null or s.current_period_end > now());

  select count(*) filter (where status = 'completed'),
         count(*) filter (where status = 'failed'),
         coalesce(sum(estimated_cost_amount) filter (where status = 'completed'), 0)
    into v_generations_30d, v_failed_generations_30d, v_ai_cost_30d
  from public.generation_usage
  where created_at >= now() - interval '30 days';

  return jsonb_build_object(
    'totalUsers', v_total_users,
    'activeSubscriptions', v_active_subscriptions,
    'monthRevenue', v_month_revenue,
    'monthOneTimeRevenue', v_month_one_time_revenue,
    'mrr', v_mrr,
    'generations30d', v_generations_30d,
    'failedGenerations30d', v_failed_generations_30d,
    'aiCost30d', v_ai_cost_30d
  );
end;
$$;

revoke all on function public.admin_overview_metrics() from public;
grant execute on function public.admin_overview_metrics() to authenticated;

commit;
