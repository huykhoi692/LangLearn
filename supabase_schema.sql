-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.daily_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  study_date date NOT NULL,
  model_name text NOT NULL DEFAULT 'gemini-1.5-flash'::text,
  difficulty_level smallint NOT NULL DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
  plan_json jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT daily_plans_pkey PRIMARY KEY (id),
  CONSTRAINT daily_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.daily_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  daily_plan_id uuid NOT NULL,
  user_id uuid NOT NULL,
  task_key text NOT NULL,
  label text NOT NULL,
  duration_min smallint NOT NULL DEFAULT 15,
  is_done boolean NOT NULL DEFAULT false,
  done_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT daily_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT daily_tasks_daily_plan_id_fkey FOREIGN KEY (daily_plan_id) REFERENCES public.daily_plans(id),
  CONSTRAINT daily_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.grammar_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  study_date date NOT NULL,
  point text NOT NULL,
  exercise text NOT NULL,
  answer text NOT NULL,
  correct_count integer NOT NULL DEFAULT 0,
  wrong_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  theory text,
  CONSTRAINT grammar_items_pkey PRIMARY KEY (id),
  CONSTRAINT grammar_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.skill_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  study_date date NOT NULL,
  skill text NOT NULL CHECK (skill = ANY (ARRAY['speaking'::text, 'writing'::text, 'reading'::text, 'listening'::text])),
  prompt_text text NOT NULL,
  user_answer text NOT NULL,
  score numeric,
  feedback_short text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT skill_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT skill_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.vocab_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  study_date date NOT NULL,
  word text NOT NULL,
  meaning text NOT NULL,
  example text,
  topic text,
  correct_count integer NOT NULL DEFAULT 0,
  wrong_count integer NOT NULL DEFAULT 0,
  next_review_at date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_mastered boolean NOT NULL DEFAULT false,
  CONSTRAINT vocab_items_pkey PRIMARY KEY (id),
  CONSTRAINT vocab_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);