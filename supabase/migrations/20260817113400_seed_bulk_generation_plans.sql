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
values
  ('generate-1', '1x Generate AI', 'one_time', 7000, 'IDR', 1, null, true),
  ('generate-3', 'Paket 3x Generate AI', 'one_time', 15000, 'IDR', 3, null, true),
  ('generate-5', 'Paket 5x Generate AI', 'one_time', 25000, 'IDR', 5, null, true),
  ('generate-10', 'Paket 10x Generate AI', 'one_time', 35000, 'IDR', 10, null, true)
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
