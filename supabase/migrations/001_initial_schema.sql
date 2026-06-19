-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── INSTITUTIONS ────────────────────────────────────────────────────────────
create type institution_type as enum ('university', 'community_college', 'trade_school', 'nonprofit');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
create type plan_tier as enum ('starter', 'standard', 'enterprise');

create table institutions (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text not null unique,
  type                institution_type not null default 'university',
  logo_url            text,
  primary_color       text default '#003087',
  stripe_customer_id  text unique,
  subscription_status subscription_status not null default 'trialing',
  plan_tier           plan_tier not null default 'starter',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table institutions enable row level security;

-- ─── INSTITUTION USERS ───────────────────────────────────────────────────────
create type staff_role as enum ('admin', 'reviewer', 'viewer');

create table institution_users (
  id                   uuid primary key default gen_random_uuid(),
  institution_id       uuid not null references institutions(id) on delete cascade,
  supabase_auth_user_id uuid not null unique,
  email                text not null,
  full_name            text,
  role                 staff_role not null default 'reviewer',
  created_at           timestamptz not null default now()
);

alter table institution_users enable row level security;

-- Helper: get current user's institution_id
create or replace function current_institution_id()
returns uuid language sql stable security definer as $$
  select institution_id from institution_users
  where supabase_auth_user_id = auth.uid()
  limit 1;
$$;

-- Helper: get current user's role
create or replace function current_staff_role()
returns staff_role language sql stable security definer as $$
  select role from institution_users
  where supabase_auth_user_id = auth.uid()
  limit 1;
$$;

-- ─── SCHOLARSHIPS ────────────────────────────────────────────────────────────
create type scholarship_scope as enum ('federal', 'state', 'institutional');
create type scholarship_status as enum ('active', 'inactive', 'archived');

create table scholarships (
  id                  uuid primary key default gen_random_uuid(),
  institution_id      uuid references institutions(id) on delete cascade,  -- null = federal/state
  scope               scholarship_scope not null default 'institutional',
  name                text not null,
  description         text,
  award_amount_min    numeric(10,2),
  award_amount_max    numeric(10,2),
  renewable           boolean not null default false,
  deadline            date,
  criteria_schema     jsonb not null default '{"match_logic":"all","criteria":[],"required_documents":[]}',
  status              scholarship_status not null default 'active',
  source_url          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table scholarships enable row level security;

-- ─── STUDENTS ────────────────────────────────────────────────────────────────
create table students (
  id                   uuid primary key default gen_random_uuid(),
  institution_id       uuid not null references institutions(id) on delete cascade,
  supabase_auth_user_id uuid unique,
  email                text not null,
  full_name            text not null,
  phone                text,
  date_of_birth        date,
  created_at           timestamptz not null default now()
);

alter table students enable row level security;

-- ─── APPLICATIONS ────────────────────────────────────────────────────────────
create type application_status as enum ('draft', 'submitted', 'matching', 'matched', 'completed');

create table applications (
  id                        uuid primary key default gen_random_uuid(),
  institution_id            uuid not null references institutions(id) on delete cascade,
  student_id                uuid not null references students(id) on delete cascade,
  academic_year             text not null,  -- e.g. '2025-2026'
  status                    application_status not null default 'draft',
  -- academic
  gpa_unweighted            numeric(3,2),
  gpa_weighted              numeric(3,2),
  sat_score                 integer,
  act_score                 integer,
  degree_level              text,           -- 'associate','bachelor','master','doctoral','certificate'
  intended_major            text,
  -- eligibility flags
  residency_state           text,
  household_income_bracket  text,           -- very_low|low|moderate|middle|upper_middle|high
  is_first_generation       boolean,
  is_first_time_in_college  boolean,
  is_national_merit_finalist boolean,
  is_veteran_or_dependent   boolean,
  has_disability_documentation boolean,
  fafsa_on_file             boolean,
  ffaa_on_file              boolean,
  community_service_hours   integer,
  free_text_essay           text,
  -- metadata
  submitted_at              timestamptz,
  matched_at                timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

alter table applications enable row level security;

-- ─── SCHOLARSHIP MATCHES ─────────────────────────────────────────────────────
create type match_status as enum (
  'ai_suggested', 'staff_approved', 'staff_rejected', 'letter_generated', 'letter_sent'
);

create table scholarship_matches (
  id                  uuid primary key default gen_random_uuid(),
  institution_id      uuid not null references institutions(id) on delete cascade,
  application_id      uuid not null references applications(id) on delete cascade,
  scholarship_id      uuid not null references scholarships(id) on delete cascade,
  status              match_status not null default 'ai_suggested',
  confidence_score    numeric(3,2),        -- 0.00–1.00
  match_reasoning     text,
  review_flags        jsonb default '[]',  -- array of flag strings
  per_criterion_results jsonb,             -- array of {criterion, passed, reason}
  reviewed_by         uuid references institution_users(id),
  reviewed_at         timestamptz,
  created_at          timestamptz not null default now(),
  unique(application_id, scholarship_id)
);

alter table scholarship_matches enable row level security;

-- ─── ELIGIBILITY LETTERS ─────────────────────────────────────────────────────
create type letter_status as enum ('draft', 'approved', 'sent');

create table eligibility_letters (
  id             uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institutions(id) on delete cascade,
  match_id       uuid not null references scholarship_matches(id) on delete cascade,
  storage_path   text,                  -- Supabase Storage path
  letter_body    text,                  -- raw text for re-gen
  status         letter_status not null default 'draft',
  approved_by    uuid references institution_users(id),
  approved_at    timestamptz,
  sent_at        timestamptz,
  created_at     timestamptz not null default now(),
  unique(match_id)
);

alter table eligibility_letters enable row level security;

-- ─── RLS POLICIES ────────────────────────────────────────────────────────────

-- institutions: staff can view their own institution
create policy "Staff see own institution"
  on institutions for select
  using (id = current_institution_id());

create policy "Admins update own institution"
  on institutions for update
  using (id = current_institution_id() and current_staff_role() = 'admin');

-- institution_users: staff see peers at same institution
create policy "Staff see own institution users"
  on institution_users for select
  using (institution_id = current_institution_id());

-- scholarships: staff see their institution's + all federal/state
create policy "Staff see own and public scholarships"
  on scholarships for select
  using (institution_id = current_institution_id() or institution_id is null);

create policy "Admins manage scholarships"
  on scholarships for all
  using (institution_id = current_institution_id() and current_staff_role() = 'admin');

-- students: staff see students at their institution
create policy "Staff see own students"
  on students for select
  using (institution_id = current_institution_id());

-- Students see own record
create policy "Students see own record"
  on students for select
  using (supabase_auth_user_id = auth.uid());

-- applications: staff see applications at their institution
create policy "Staff see own applications"
  on applications for select
  using (institution_id = current_institution_id());

-- Students see own applications
create policy "Students see own applications"
  on applications for all
  using (
    student_id in (
      select id from students where supabase_auth_user_id = auth.uid()
    )
  );

-- scholarship_matches: staff see matches at their institution
create policy "Staff see own matches"
  on scholarship_matches for select
  using (institution_id = current_institution_id());

create policy "Staff update matches"
  on scholarship_matches for update
  using (institution_id = current_institution_id() and current_staff_role() in ('admin', 'reviewer'));

-- eligibility_letters: staff see their institution's letters
create policy "Staff see own letters"
  on eligibility_letters for select
  using (institution_id = current_institution_id());

create policy "Staff update letters"
  on eligibility_letters for update
  using (institution_id = current_institution_id() and current_staff_role() in ('admin', 'reviewer'));

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger institutions_updated_at before update on institutions
  for each row execute procedure set_updated_at();
create trigger scholarships_updated_at before update on scholarships
  for each row execute procedure set_updated_at();
create trigger applications_updated_at before update on applications
  for each row execute procedure set_updated_at();

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index on applications(institution_id, status);
create index on scholarship_matches(institution_id, status);
create index on scholarship_matches(application_id);
create index on eligibility_letters(match_id);
create index on scholarships(scope, status);

-- ─── STORAGE BUCKET ──────────────────────────────────────────────────────────
-- Run via Supabase dashboard or supabase-js admin:
-- insert into storage.buckets (id, name, public) values ('eligibility-letters', 'eligibility-letters', false);
