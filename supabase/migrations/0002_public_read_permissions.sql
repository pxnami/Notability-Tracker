grant usage on schema public to anon, authenticated;

grant select on table
  public.sources,
  public.source_records,
  public.issues,
  public.feature_requests,
  public.issue_sources,
  public.status_history,
  public.release_notes
to anon, authenticated;
