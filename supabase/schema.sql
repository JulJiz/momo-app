create table if not exists public.sessions (
  session_code text primary key,
  status text not null check (status in ('waiting', 'active', 'paused', 'ended')),
  created_at bigint not null,
  duration_seconds integer not null,
  remaining_seconds integer not null,
  started_at bigint,
  paused_at bigint,
  ended_at bigint,
  updated_at bigint not null
);

create table if not exists public.students (
  session_code text not null references public.sessions(session_code) on delete cascade,
  student_id text not null,
  device_id text not null,
  nickname text not null,
  status text not null,
  connected boolean not null default false,
  joined_at bigint not null,
  last_active_at bigint not null,
  primary key (session_code, device_id)
);

create table if not exists public.strokes (
  stroke_id text primary key,
  session_code text not null references public.sessions(session_code) on delete cascade,
  device_id text not null,
  x double precision not null,
  y double precision not null,
  prev_x double precision,
  prev_y double precision,
  color text not null,
  brush_type text not null,
  brush_size double precision not null,
  tool text not null,
  sequence integer not null,
  created_at bigint not null
);

create table if not exists public.sensor_events (
  sensor_event_id text primary key,
  session_code text not null references public.sessions(session_code) on delete cascade,
  device_id text not null,
  tilt jsonb,
  shake boolean not null default false,
  orientation text,
  created_at bigint not null
);

create table if not exists public.ai_feedback (
  feedback_id text primary key,
  session_code text not null references public.sessions(session_code) on delete cascade,
  device_id text,
  feedback_type text not null,
  points integer not null default 0,
  message text not null,
  metadata jsonb,
  created_at bigint not null
);

create index if not exists idx_students_session_code
  on public.students(session_code);

create index if not exists idx_strokes_session_sequence
  on public.strokes(session_code, sequence);

create index if not exists idx_sensor_events_session_created
  on public.sensor_events(session_code, created_at);

create index if not exists idx_ai_feedback_session_created
  on public.ai_feedback(session_code, created_at);
