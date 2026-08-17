begin;

insert into public.plans (
  code,
  name,
  billing_type,
  price_amount,
  currency,
  generation_quota,
  interval_unit,
  is_active
)
values (
  'pro-monthly',
  'Satuna Pro Bulanan',
  'subscription',
  59000,
  'IDR',
  null,
  'month',
  true
)
on conflict (code)
do update set
  name = excluded.name,
  billing_type = excluded.billing_type,
  price_amount = excluded.price_amount,
  currency = excluded.currency,
  generation_quota = excluded.generation_quota,
  interval_unit = excluded.interval_unit,
  is_active = excluded.is_active,
  updated_at = now();

commit;
