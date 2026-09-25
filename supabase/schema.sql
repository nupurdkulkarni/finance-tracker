-- =========================================================
-- NuPra Finance - Database Schema & Security Policies
-- Full support for Personal & Collaborative Couple Finance
-- Realtime sync, multi-currency (EUR/INR), Goals, Stocks, Bills
-- =========================================================

create extension if not exists pgcrypto;

-- 1. Profiles Table (Supports photo avatar, currency EUR/INR, partner info)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  preferred_currency text not null default 'INR',
  partner_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Workspaces (Personal or Couple space with invite code)
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check(type in ('personal','couple')),
  currency text not null default 'INR',
  invite_code text unique,
  owner_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- 3. Workspace Members
create table if not exists public.workspace_members (
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member',
  nickname text,
  avatar_url text,
  joined_at timestamptz not null default now(),
  primary key(workspace_id, user_id)
);

-- 4. Categories (Salary, Rent, Food, Leisure, Travel, Health, Hobby, etc.)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#6366F1',
  icon text not null default 'pricetag',
  type text not null check(type in ('income','expense','investment')),
  monthly_budget numeric(12,2) default 0,
  created_at timestamptz not null default now()
);

-- 5. Payment Methods (Credit Card, Cash, Bank Transfer, UPI/Pix, Debit Card)
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  type text not null default 'other',
  icon text default 'card',
  created_at timestamptz not null default now()
);

-- 6. Transactions (Income, Expense, Bill payment with payer info)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  paid_by uuid not null references auth.users(id),
  type text not null check(type in ('income','expense','investment','bill')),
  amount numeric(12,2) not null check(amount > 0),
  currency text not null default 'INR',
  category_id uuid references public.categories(id) on delete set null,
  payment_method_id uuid references public.payment_methods(id) on delete set null,
  description text,
  transaction_date date not null default current_date,
  is_bill boolean not null default false,
  is_paid boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Couple Financial Goals (Target amount, current saved, progress, deadline)
create table if not exists public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  target_amount numeric(12,2) not null check(target_amount > 0),
  current_amount numeric(12,2) not null default 0,
  currency text not null default 'INR',
  target_date date,
  category text default 'General',
  icon text default 'trophy',
  color text not null default '#F43F5E',
  is_shared boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. Stock Market & Investments Tracker
create table if not exists public.stock_investments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  asset_name text not null,
  ticker text,
  asset_type text not null check(asset_type in ('stock','etf','crypto','mutual_fund','sip')),
  invested_amount numeric(12,2) not null check(invested_amount > 0),
  current_value numeric(12,2) not null default 0,
  currency text not null default 'INR',
  purchase_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. Bills & Upcoming Payments Tracker
create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check(amount > 0),
  currency text not null default 'INR',
  due_date date not null,
  is_paid boolean not null default false,
  category_id uuid references public.categories(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  paid_by uuid references auth.users(id) on delete set null,
  payment_method_id uuid references public.payment_methods(id) on delete set null,
  notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes for lightning fast queries
create index if not exists transactions_workspace_date_idx on public.transactions(workspace_id, transaction_date);
create index if not exists goals_workspace_idx on public.financial_goals(workspace_id);
create index if not exists investments_workspace_idx on public.stock_investments(workspace_id, purchase_date);
create index if not exists bills_workspace_idx on public.bills(workspace_id, due_date);

-- Security: Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.categories enable row level security;
alter table public.payment_methods enable row level security;
alter table public.transactions enable row level security;
alter table public.financial_goals enable row level security;
alter table public.stock_investments enable row level security;
alter table public.bills enable row level security;

-- Workspace membership security helper function
create or replace function public.is_workspace_member(wid uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.workspace_members where workspace_id = wid and user_id = auth.uid()
  );
$$;

-- RLS Policies
-- Profiles: Any authenticated user can read profiles of partners; update their own
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using(true);

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for all using(id = auth.uid()) with check(id = auth.uid());

-- Workspace Members
drop policy if exists workspace_members_read on public.workspace_members;
create policy workspace_members_read on public.workspace_members for select using(user_id = auth.uid() or public.is_workspace_member(workspace_id));

drop policy if exists workspace_members_insert on public.workspace_members;
create policy workspace_members_insert on public.workspace_members for insert with check(user_id = auth.uid() or public.is_workspace_member(workspace_id));

-- Workspaces
drop policy if exists workspaces_read on public.workspaces;
create policy workspaces_read on public.workspaces for select using(owner_id = auth.uid() or public.is_workspace_member(id));

drop policy if exists workspaces_insert on public.workspaces;
create policy workspaces_insert on public.workspaces for insert with check(owner_id = auth.uid());

drop policy if exists workspaces_update on public.workspaces;
create policy workspaces_update on public.workspaces for update using(owner_id = auth.uid() or public.is_workspace_member(id));

-- Categories & Payment Methods
drop policy if exists categories_member on public.categories;
create policy categories_member on public.categories for all using(public.is_workspace_member(workspace_id)) with check(public.is_workspace_member(workspace_id));

drop policy if exists payment_methods_member on public.payment_methods;
create policy payment_methods_member on public.payment_methods for all using(public.is_workspace_member(workspace_id)) with check(public.is_workspace_member(workspace_id));

-- Transactions
drop policy if exists transactions_member_read on public.transactions;
create policy transactions_member_read on public.transactions for select using(public.is_workspace_member(workspace_id));

drop policy if exists transactions_member_insert on public.transactions;
create policy transactions_member_insert on public.transactions for insert with check(public.is_workspace_member(workspace_id) and created_by = auth.uid());

drop policy if exists transactions_creator_update on public.transactions;
create policy transactions_creator_update on public.transactions for update using(public.is_workspace_member(workspace_id));

drop policy if exists transactions_creator_delete on public.transactions;
create policy transactions_creator_delete on public.transactions for delete using(public.is_workspace_member(workspace_id));

-- Financial Goals
drop policy if exists goals_member on public.financial_goals;
create policy goals_member on public.financial_goals for all using(public.is_workspace_member(workspace_id)) with check(public.is_workspace_member(workspace_id));

-- Stock Investments
drop policy if exists investments_member on public.stock_investments;
create policy investments_member on public.stock_investments for all using(public.is_workspace_member(workspace_id)) with check(public.is_workspace_member(workspace_id));

-- Bills
drop policy if exists bills_member on public.bills;
create policy bills_member on public.bills for all using(public.is_workspace_member(workspace_id)) with check(public.is_workspace_member(workspace_id));

-- Realtime publication for simultaneous couple collaboration
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.financial_goals;
alter publication supabase_realtime add table public.stock_investments;
alter publication supabase_realtime add table public.bills;
