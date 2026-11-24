-- ==============================================================================
-- Supabase Schema for Expense Manager (Shared Company Data Without Auth)
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/heqpedevkrehdekshtig/sql/new
-- ==============================================================================

-- 1. Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    employee TEXT NOT NULL,
    department TEXT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    vendor TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'UPI',
    amount NUMERIC NOT NULL,
    paid_by TEXT NOT NULL DEFAULT 'Company',
    reimbursement_status TEXT NOT NULL DEFAULT 'Not Applicable',
    reimbursement_amount NUMERIC,
    reimbursed_date TEXT,
    notes TEXT,
    receipt TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for fast filtering & sorting
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_employee ON public.expenses(employee);
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON public.expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_expenses_reimbursement ON public.expenses(reimbursement_status);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed default categories if empty
INSERT INTO public.categories (id, name, color) VALUES
    ('c1', 'Office Supplies', '#EAF2FF'),
    ('c2', 'Travel', '#DFF5EF'),
    ('c3', 'Food & Meals', '#FFE8E1'),
    ('c4', 'Transportation', '#E6F4EA'),
    ('c5', 'Software & Subscriptions', '#EEE9FF'),
    ('c6', 'Marketing', '#FFE8E1'),
    ('c7', 'Equipment', '#EEEDFF'),
    ('c8', 'Internet & Utilities', '#FFF3D6'),
    ('c9', 'Client Expenses', '#FDE8ED'),
    ('c10', 'Salaries / Staff Expenses', '#F3F4F6'),
    ('c11', 'Client Entertainment', '#DFF5EF'),
    ('c12', 'Miscellaneous', '#F3F4F6')
ON CONFLICT (id) DO NOTHING;

-- 3. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    company_name TEXT NOT NULL DEFAULT 'Acutix Soft LLP',
    default_currency TEXT NOT NULL DEFAULT 'INR',
    financial_year_start_month INTEGER NOT NULL DEFAULT 4,
    appearance TEXT DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed initial settings
INSERT INTO public.settings (id, company_name, default_currency, financial_year_start_month, appearance, notifications_enabled)
VALUES ('default', 'Acutix Soft LLP', 'INR', 4, 'light', true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- We enable RLS and explicitly grant access to anon & authenticated roles.
-- This ensures RLS is active (not disabled) while allowing shared company access
-- through the public publishable key without requiring user login accounts.
-- ==============================================================================

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Expenses Policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Allow public read access to expenses') THEN
        CREATE POLICY "Allow public read access to expenses" ON public.expenses FOR SELECT TO anon, authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Allow public insert access to expenses') THEN
        CREATE POLICY "Allow public insert access to expenses" ON public.expenses FOR INSERT TO anon, authenticated WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Allow public update access to expenses') THEN
        CREATE POLICY "Allow public update access to expenses" ON public.expenses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Allow public delete access to expenses') THEN
        CREATE POLICY "Allow public delete access to expenses" ON public.expenses FOR DELETE TO anon, authenticated USING (true);
    END IF;
END $$;

-- Categories Policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow public read access to categories') THEN
        CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow public modify access to categories') THEN
        CREATE POLICY "Allow public modify access to categories" ON public.categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Settings Policies
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow public read access to settings') THEN
        CREATE POLICY "Allow public read access to settings" ON public.settings FOR SELECT TO anon, authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Allow public modify access to settings') THEN
        CREATE POLICY "Allow public modify access to settings" ON public.settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
