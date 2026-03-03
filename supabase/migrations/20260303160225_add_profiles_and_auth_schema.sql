-- 1. Create profiles table for matching user_nickname with auth.users
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nickname text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 2. Add nickname column to posts table
alter table posts add column if not exists nickname text;

-- Posts RLS update
create policy "Authenticated users can insert posts" on posts for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own posts" on posts for update using (auth.uid() = user_id);
create policy "Users can delete their own posts" on posts for delete using (auth.uid() = user_id);

-- 3. Modify comments table to rely on authentication instead of password
alter table comments drop column if exists password;
alter table comments add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Comments RLS update
drop policy if exists "Anyone can insert a comment." on comments;
drop policy if exists "Anyone can update a comment." on comments;
drop policy if exists "Anyone can delete a comment." on comments;

create policy "Authenticated users can insert comments" on comments for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own comments" on comments for update using (auth.uid() = user_id);
create policy "Users can delete their own comments" on comments for delete using (auth.uid() = user_id);
