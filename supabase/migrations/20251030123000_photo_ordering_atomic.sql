-- Unique ordering per property
create unique index if not exists uniq_property_photo_order
  on public.property_photos(property_id, sort_order);

-- RPC: Upload (DB insert) picks next sort_order atomically and enforces max 10
create or replace function public.rpc_property_photo_insert(
  p_property_id uuid,
  p_file_path text
)
returns public.property_photos
language plpgsql
security definer
as $$
declare
  v_count integer;
  v_next integer;
  v_row public.property_photos;
begin
  -- Serialize per property
  perform pg_advisory_xact_lock(hashtext(p_property_id::text));

  select count(*) into v_count from public.property_photos where property_id = p_property_id;
  if v_count >= 10 then
    raise exception 'Maximum 10 photos allowed per property';
  end if;

  select coalesce(max(sort_order) + 1, 0) into v_next from public.property_photos where property_id = p_property_id;

  insert into public.property_photos(property_id, file_path, sort_order)
  values (p_property_id, p_file_path, v_next)
  returning * into v_row;

  return v_row;
end;
$$;

-- RPC: Reorder all photos atomically
create or replace function public.rpc_property_photos_reorder(
  p_property_id uuid,
  p_photo_ids uuid[]
)
returns void
language plpgsql
security definer
as $$
begin
  perform pg_advisory_xact_lock(hashtext(p_property_id::text));

  -- Update using unnest with ordinality for a single-pass reorder
  with new_orders as (
    select id, ord - 1 as new_sort
    from unnest(p_photo_ids) with ordinality as t(id, ord)
  )
  update public.property_photos p
  set sort_order = n.new_sort
  from new_orders n
  where p.id = n.id and p.property_id = p_property_id;

end;
$$;

-- RPC: Delete one photo and compact ordering
create or replace function public.rpc_property_photo_delete(
  p_property_id uuid,
  p_photo_id uuid
)
returns text -- returns file_path to delete in storage
language plpgsql
security definer
as $$
declare
  v_file_path text;
begin
  perform pg_advisory_xact_lock(hashtext(p_property_id::text));

  select file_path into v_file_path
  from public.property_photos
  where id = p_photo_id and property_id = p_property_id
  for update;

  if v_file_path is null then
    raise exception 'Photo not found';
  end if;

  delete from public.property_photos where id = p_photo_id and property_id = p_property_id;

  -- Compact ordering to 0..n-1
  with ordered as (
    select id, row_number() over (order by sort_order) - 1 as rn
    from public.property_photos
    where property_id = p_property_id
  )
  update public.property_photos p
  set sort_order = o.rn
  from ordered o
  where p.id = o.id;

  return v_file_path;
end;
$$;
