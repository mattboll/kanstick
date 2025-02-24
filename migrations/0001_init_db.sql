create extension "uuid-ossp";

create type user_role as enum ('owner', 'admin', 'user');

create type action_type as enum (
  'card_deleted', 'card_renamed', 'card_moved', 'card_comment_added', 'card_tag_added', 'card_tag_removed'
  'list_deleted', 'list_renamed', 'list_moved',
  'board_deleted', 'board_renamed');


CREATE TABLE verification_token
(
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
 
  PRIMARY KEY (identifier, token)
);
 
CREATE TABLE accounts
(
  id SERIAL,
  "userId" INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
 
  PRIMARY KEY (id)
);
 
CREATE TABLE sessions
(
  id SERIAL,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,
 
  PRIMARY KEY (id)
);
 
CREATE TABLE users
(
  id SERIAL,
  name VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
 
  PRIMARY KEY (id)
);

create table project (
    id uuid primary key default uuid_generate_v4(),
    project_name varchar(100) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table board (
    id uuid primary key default uuid_generate_v4(),
    title varchar(100) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    project_id uuid references project(id) on delete cascade
);

create table list (
    id uuid primary key default uuid_generate_v4(),
    title varchar(100) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    pos numeric not null,
    board_id uuid references board(id) on delete cascade
);

create table card (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  list_id uuid references list(id) on delete cascade,
  pos numeric not null,
  author_id serial references users(id),
  archived bool not null default false
);

create table tag (
  id uuid primary key default uuid_generate_v4(),
  tag_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  board_id uuid references board(id) on delete cascade
);

create table comment (
  id uuid primary key default uuid_generate_v4(),
  comment text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  card_id uuid references card(id) on delete cascade,
  user_id serial references users(id) on delete cascade
);

create table task_list (
  id uuid primary key default uuid_generate_v4(),
  content varchar(100) not null
);

create table task (
  id uuid primary key default uuid_generate_v4(),
  content varchar(250) not null,
  task_list_id uuid references task_list(id) on delete cascade
);

create table action_history (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  action_type action_type not null,
  object_id uuid,
  text varchar(100)
);

create table user_project (
  user_id serial references users(id) on delete cascade,
  project_id uuid references project(id) on delete cascade,
  user_role user_role not null,
  PRIMARY KEY (user_id, project_id)
);

create table user_board (
  user_id serial references users(id) on delete cascade,
  board_id uuid references board(id) on delete cascade,
  user_role user_role not null,
  PRIMARY KEY (user_id, board_id)
);

create table card_tag (
  card_id uuid references card(id) on delete cascade,
  tag_id uuid references tag(id) on delete cascade,
  PRIMARY KEY (card_id, tag_id)
);

create table card_member (
  member_id serial references users(id) on delete cascade,
  card_id uuid references card(id) on delete cascade,
  PRIMARY KEY (member_id, card_id)
);

 CREATE OR REPLACE FUNCTION insert_card(_list_id uuid, _title text, _author_id INT, _before_id uuid DEFAULT NULL)
 RETURNS TABLE (card_id uuid, new_pos numeric) AS $$
 DECLARE
     new_pos NUMERIC;
     before_pos NUMERIC;
     after_pos NUMERIC;
     new_card_id uuid;
 BEGIN
     IF _before_id IS NOT NULL THEN
         SELECT pos INTO before_pos FROM card WHERE id = _before_id;
         SELECT pos INTO after_pos
         FROM card
         WHERE list_id = _list_id AND pos < before_pos
         ORDER BY pos DESC
         LIMIT 1;
         new_pos := (before_pos + COALESCE(after_pos, before_pos - 1)) / 2.0;
     ELSE
         SELECT pos INTO before_pos
         FROM card
         WHERE list_id = _list_id
         ORDER BY pos DESC
         LIMIT 1;
         new_pos := before_pos + 1;
     END IF;
     INSERT INTO card (list_id, pos, title, author_id)
     VALUES (_list_id, COALESCE(new_pos, 0), _title, _author_id)
     RETURNING id INTO new_card_id;
     RETURN QUERY SELECT new_card_id, new_pos;
 END;
 $$ LANGUAGE plpgsql;


 CREATE OR REPLACE FUNCTION move_card(_card_id uuid, _new_list_id uuid, _before_id uuid DEFAULT NULL)
 RETURNS numeric AS $$
 DECLARE
     new_pos NUMERIC;
     before_pos NUMERIC;
     after_pos NUMERIC;
 BEGIN
     IF _before_id IS NOT NULL THEN
         SELECT pos INTO before_pos FROM card WHERE id = _before_id;
         SELECT pos INTO after_pos
         FROM card
         WHERE list_id = _new_list_id AND pos < before_pos
         ORDER BY pos DESC
         LIMIT 1;
         IF after_pos IS NULL THEN
             new_pos := before_pos - 1;
         ELSE
             new_pos := (before_pos + after_pos) / 2.0;
         END IF;
     ELSE
         SELECT pos INTO before_pos
         FROM card
         WHERE list_id = _new_list_id
         ORDER BY pos DESC
         LIMIT 1;
         new_pos := COALESCE(before_pos, 0) + 1;
     END IF;
     UPDATE card
     SET list_id = _new_list_id, pos = new_pos
     WHERE id = _card_id;
     RETURN new_pos;
 END;
 $$ LANGUAGE plpgsql;



 CREATE OR REPLACE FUNCTION insert_list(_board_id uuid, _title text, _before_id uuid DEFAULT NULL)
 RETURNS TABLE (list_id uuid, new_pos numeric) AS $$
 DECLARE
     new_pos NUMERIC;
     before_pos NUMERIC;
     after_pos NUMERIC;
     new_list_id uuid;
 BEGIN
     IF _before_id IS NOT NULL THEN
         SELECT pos INTO before_pos FROM list WHERE id = _before_id;
         SELECT pos INTO after_pos
         FROM list
         WHERE board_id = _board_id AND pos < before_pos
         ORDER BY pos DESC
         LIMIT 1;
         new_pos := (before_pos + COALESCE(after_pos, before_pos - 1)) / 2.0;
     ELSE
         SELECT pos INTO before_pos
         FROM list
         WHERE board_id = _board_id
         ORDER BY pos DESC
         LIMIT 1;
         new_pos := before_pos + 1;
     END IF;
     INSERT INTO list (board_id, pos, title)
     VALUES (_board_id, COALESCE(new_pos, 0), _title)
     RETURNING id INTO new_list_id;
     RETURN QUERY SELECT new_list_id, new_pos;
 END;
 $$ LANGUAGE plpgsql;
