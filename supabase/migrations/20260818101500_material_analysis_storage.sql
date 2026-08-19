begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'material-analysis',
  'material-analysis',
  false,
  15728640,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id)
do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "material analysis upload own folder" on storage.objects;
create policy "material analysis upload own folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'material-analysis'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

drop policy if exists "material analysis read own files" on storage.objects;
create policy "material analysis read own files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'material-analysis'
  and owner_id = (select auth.uid()::text)
);

drop policy if exists "material analysis delete own files" on storage.objects;
create policy "material analysis delete own files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'material-analysis'
  and owner_id = (select auth.uid()::text)
);

commit;
