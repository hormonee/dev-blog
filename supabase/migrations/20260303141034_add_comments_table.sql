-- Create comments table
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  author_name text not null,
  password text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table comments enable row level security;

-- Policies to allow public read/write
create policy "Comments are viewable by everyone." on comments for select using (true);
create policy "Anyone can insert a comment." on comments for insert with check (true);
create policy "Anyone can update a comment." on comments for update using (true);
create policy "Anyone can delete a comment." on comments for delete using (true);
