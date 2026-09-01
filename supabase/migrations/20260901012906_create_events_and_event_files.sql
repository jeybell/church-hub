-- 행사 게시판 스키마
-- 게시글(행사) 1건에 드라이브 파일 여러 개가 묶인다.
-- 파일 실물은 드라이브에 있고, 여기에는 참조와 표시용 메타데이터만 둔다.

create type event_status as enum ('planned', 'ongoing', 'done');

create table events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (length(trim(title)) > 0),
  body        text not null default '',
  -- 드라이브 최상위 폴더 이름(부서)과 맞춘다. 폴더 id 가 아니라 이름을 쓰는 이유는
  -- 드라이브 계정을 옮겨도 게시글이 끊기지 않게 하기 위해서다.
  department  text not null,
  status      event_status not null default 'planned',
  event_date  date,
  author      text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table event_files (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  drive_file_id text not null,
  name          text not null,
  mime_type     text not null,
  size          bigint not null default 0,
  created_at    timestamptz not null default now(),
  unique (event_id, drive_file_id)
);

-- 목록은 행사일 최신순, 부서/상태로 거른다.
create index events_event_date_idx on events (event_date desc nulls last);
create index events_department_idx on events (department);
create index events_status_idx     on events (status);
create index event_files_event_idx on event_files (event_id);

create function set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
  before update on events
  for each row execute function set_updated_at();

-- RLS 를 켜되 정책은 두지 않는다. 앱은 서버에서 service role 키로만 접근하므로
-- 공개 anon 키로는 아무것도 읽거나 쓸 수 없다.
alter table events      enable row level security;
alter table event_files enable row level security;
