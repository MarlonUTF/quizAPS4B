-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.category (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  category_name text,
  category_description text,
  CONSTRAINT category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.option (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  option_text text,
  is_correct boolean,
  question_id uuid,
  CONSTRAINT option_pkey PRIMARY KEY (id),
  CONSTRAINT option_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id)
);
CREATE TABLE public.player_answer (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  session_player_id uuid NOT NULL,
  quiz_question_id uuid NOT NULL,
  option_id uuid,
  time_taken integer,
  answered_at timestamp with time zone DEFAULT now(),
  CONSTRAINT player_answer_pkey PRIMARY KEY (id),
  CONSTRAINT player_answer_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.session(id),
  CONSTRAINT player_answer_session_player_id_fkey FOREIGN KEY (session_player_id) REFERENCES public.session_player(id),
  CONSTRAINT player_answer_quiz_question_id_fkey FOREIGN KEY (quiz_question_id) REFERENCES public.quiz_question(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text,
  created_at timestamp without time zone,
  role text,
  email text,
  password text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.question (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  question_text text,
  category_id uuid,
  CONSTRAINT question_pkey PRIMARY KEY (id),
  CONSTRAINT question_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id)
);
CREATE TABLE public.quiz (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_name text,
  quiz_description text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT quiz_pkey PRIMARY KEY (id)
);
CREATE TABLE public.quiz_question (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  quiz_id uuid,
  question_id uuid,
  order_number integer,
  CONSTRAINT quiz_question_pkey PRIMARY KEY (id),
  CONSTRAINT quiz_question_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quiz(id),
  CONSTRAINT quiz_question_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id)
);
CREATE TABLE public.session (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL,
  code text NOT NULL,
  name text,
  description text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'pending'::text,
  current_order integer DEFAULT 0,
  question_started_at timestamp with time zone,
  question_time_limit integer DEFAULT 20,
  CONSTRAINT session_pkey PRIMARY KEY (id),
  CONSTRAINT session_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quiz(id),
  CONSTRAINT session_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);
CREATE TABLE public.session_player (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  profile_id uuid,
  nickname text NOT NULL,
  emoji text NOT NULL,
  color text NOT NULL,
  is_admin boolean DEFAULT false,
  connected boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT session_player_pkey PRIMARY KEY (id),
  CONSTRAINT session_player_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.session(id)
);