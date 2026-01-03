-- 1. Create the table for storing energy data
create table energy_readings (
  id uuid primary key default gen_random_uuid(),
  voltage real,
  current real,
  power real,
  energy_kwh real,
  cost_rs real,
  created_at timestamp with time zone default now()
);

-- 2. Enable Realtime for this table
-- This allows the frontend to subscribe to INSERT events
alter publication supabase_realtime add table energy_readings;

-- 3. (Optional) Create an index on created_at for faster historical queries
create index idx_energy_created_at on energy_readings(created_at desc);
