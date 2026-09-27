grant usage on schema public to service_role;
grant select, insert, update on table
  public.sources,
  public.source_records,
  public.sync_jobs,
  public.sync_logs
to service_role;
