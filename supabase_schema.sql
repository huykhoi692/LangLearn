create table if not exists public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  study_date date not null,
  model_name text not null default 'gemini-1.5-flash',
  plan_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, study_date)
);

create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  daily_plan_id uuid not null references public.daily_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_key text not null,
  label text not null,
  duration_min smallint not null default 15,
  is_done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.daily_plans enable row level security;
alter table public.daily_tasks enable row level security;

drop policy if exists plans_select_own on public.daily_plans;
create policy plans_select_own on public.daily_plans for select using (auth.uid() = user_id);
drop policy if exists plans_insert_own on public.daily_plans;
create policy plans_insert_own on public.daily_plans for insert with check (auth.uid() = user_id);
drop policy if exists plans_update_own on public.daily_plans;
create policy plans_update_own on public.daily_plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists plans_delete_own on public.daily_plans;
create policy plans_delete_own on public.daily_plans for delete using (auth.uid() = user_id);

drop policy if exists tasks_select_own on public.daily_tasks;
create policy tasks_select_own on public.daily_tasks for select using (auth.uid() = user_id);
drop policy if exists tasks_insert_own on public.daily_tasks;
create policy tasks_insert_own on public.daily_tasks for insert with check (auth.uid() = user_id);
drop policy if exists tasks_update_own on public.daily_tasks;
create policy tasks_update_own on public.daily_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists tasks_delete_own on public.daily_tasks;
create policy tasks_delete_own on public.daily_tasks for delete using (auth.uid() = user_id);

create table if not exists public.vocab_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  study_date date not null,
  word text not null,
  meaning text not null,
  example text,
  topic text,
  is_mastered boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, study_date, word)
);

create table if not exists public.grammar_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  study_date date not null,
  point text not null,
  exercise text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  unique(user_id, study_date, point, exercise)
);

alter table public.vocab_items enable row level security;
alter table public.grammar_items enable row level security;

drop policy if exists vocab_select_own on public.vocab_items;
create policy vocab_select_own on public.vocab_items for select using (auth.uid() = user_id);
drop policy if exists vocab_insert_own on public.vocab_items;
create policy vocab_insert_own on public.vocab_items for insert with check (auth.uid() = user_id);
drop policy if exists vocab_update_own on public.vocab_items;
create policy vocab_update_own on public.vocab_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists vocab_delete_own on public.vocab_items;
create policy vocab_delete_own on public.vocab_items for delete using (auth.uid() = user_id);

drop policy if exists grammar_select_own on public.grammar_items;
create policy grammar_select_own on public.grammar_items for select using (auth.uid() = user_id);
drop policy if exists grammar_insert_own on public.grammar_items;
create policy grammar_insert_own on public.grammar_items for insert with check (auth.uid() = user_id);
drop policy if exists grammar_update_own on public.grammar_items;
create policy grammar_update_own on public.grammar_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists grammar_delete_own on public.grammar_items;
create policy grammar_delete_own on public.grammar_items for delete using (auth.uid() = user_id);
