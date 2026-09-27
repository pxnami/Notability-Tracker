create extension if not exists pgcrypto;

create type source_kind as enum ('productboard','reddit','github','discord','support','release_notes','status','blog');
create type source_health as enum ('healthy','stale','needs_auth','failed');
create type issue_status as enum ('Reported','Community Confirmed','Officially Acknowledged','Investigating','In Progress','Fixed','Closed','Unknown');

create table sources (
  id source_kind primary key,
  name text not null,
  url text not null,
  official boolean not null default false,
  health source_health not null default 'needs_auth',
  last_successful_sync timestamptz,
  created_at timestamptz not null default now()
);

create table source_records (
  id uuid primary key default gen_random_uuid(),
  source_id source_kind not null references sources(id),
  stable_source_id text not null,
  title text not null,
  body text,
  url text not null,
  author text,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  raw jsonb not null default '{}'::jsonb,
  unique(source_id, stable_source_id)
);

create table issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  ai_summary text,
  ai_classification text not null,
  official_status issue_status not null default 'Unknown',
  community_status issue_status not null default 'Reported',
  severity text not null default 'Medium',
  platform text not null default 'Unknown',
  app_version text,
  first_reported_at timestamptz,
  last_verified_at timestamptz,
  duplicate_key text not null,
  created_at timestamptz not null default now()
);

create table feature_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  source_id source_kind not null references sources(id),
  original_status text,
  roadmap_status text not null default 'Requested',
  vote_count integer,
  source_url text not null,
  last_verified_at timestamptz
);

create table issue_sources (
  issue_id uuid not null references issues(id) on delete cascade,
  source_record_id uuid not null references source_records(id) on delete cascade,
  evidence text,
  primary key(issue_id, source_record_id)
);

create table status_history (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  previous_status issue_status not null,
  new_status issue_status not null,
  source_url text not null,
  evidence text not null,
  changed_at timestamptz not null default now()
);

create table release_notes (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  release_date date,
  new_features text[] not null default '{}',
  improvements text[] not null default '{}',
  fixed_bugs text[] not null default '{}',
  source_url text not null,
  unique(version, source_url)
);

create table sync_jobs (
  id uuid primary key default gen_random_uuid(),
  source_id source_kind not null references sources(id),
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  records_seen integer not null default 0,
  records_changed integer not null default 0
);

create table sync_logs (
  id uuid primary key default gen_random_uuid(),
  sync_job_id uuid references sync_jobs(id) on delete cascade,
  level text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  issue_id uuid references issues(id) on delete cascade,
  feature_request_id uuid references feature_requests(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  body text not null,
  source_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  action text not null,
  target text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index source_records_search_idx on source_records using gin(to_tsvector('english', title || ' ' || coalesce(body, '')));
create index issues_search_idx on issues using gin(to_tsvector('english', title || ' ' || coalesce(ai_summary, '')));
create index issues_duplicate_key_idx on issues(duplicate_key);
create index status_history_issue_idx on status_history(issue_id, changed_at desc);

alter table sources enable row level security;
alter table source_records enable row level security;
alter table issues enable row level security;
alter table feature_requests enable row level security;
alter table issue_sources enable row level security;
alter table status_history enable row level security;
alter table release_notes enable row level security;
alter table sync_jobs enable row level security;
alter table sync_logs enable row level security;
alter table subscriptions enable row level security;
alter table notifications enable row level security;
alter table admin_audit_logs enable row level security;

create policy "public read sources" on sources for select using (true);
create policy "public read records" on source_records for select using (true);
create policy "public read issues" on issues for select using (true);
create policy "public read features" on feature_requests for select using (true);
create policy "public read issue sources" on issue_sources for select using (true);
create policy "public read status history" on status_history for select using (true);
create policy "public read release notes" on release_notes for select using (true);
