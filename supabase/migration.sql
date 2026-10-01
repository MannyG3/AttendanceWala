create table students (
  id uuid primary key default gen_random_uuid(),
  roll_no int not null unique,
  name text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent')),
  marked_at timestamptz default now(),
  unique(student_id, date)
);

create index idx_attendance_date on attendance(date);
create index idx_attendance_student on attendance(student_id);
