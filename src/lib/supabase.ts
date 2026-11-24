import { createClient } from '@supabase/supabase-js';
import type { Expense, Category, Settings } from '../types';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
// Ensure URL is a valid HTTPS endpoint; fallback to project domain if empty or misconfigured
export const SUPABASE_URL = (rawUrl && typeof rawUrl === 'string' && rawUrl.startsWith('http'))
  ? rawUrl
  : 'https://heqpedevkrehdekshtig.supabase.co';

const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const SUPABASE_ANON_KEY = (rawKey && typeof rawKey === 'string' && rawKey.trim().length > 0)
  ? rawKey
  : 'sb_publishable_MqOtsmxcb3VZPNzZMYnyuw_3N5ojkSi';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper to convert an in-memory Expense to a database row
export const toDbExpense = (expense: Expense) => ({
  id: expense.id,
  date: expense.date,
  employee: expense.employee,
  department: expense.department || null,
  category: expense.category,
  description: expense.description,
  vendor: expense.vendor,
  payment_method: expense.paymentMethod,
  amount: Number(expense.amount),
  paid_by: expense.paidBy,
  reimbursement_status: expense.reimbursementStatus,
  reimbursement_amount: (expense.reimbursementAmount !== undefined && expense.reimbursementAmount !== null)
    ? Number(expense.reimbursementAmount)
    : null,
  reimbursed_date: expense.reimbursedDate || null,
  notes: expense.notes || null,
  receipt: expense.receipt || null,
});

// Helper to convert a database row to an in-memory Expense
export const fromDbExpense = (row: any): Expense => ({
  id: String(row.id),
  date: String(row.date),
  employee: String(row.employee || ''),
  department: row.department ? String(row.department) : undefined,
  category: String(row.category || 'Miscellaneous'),
  description: String(row.description || ''),
  vendor: String(row.vendor || ''),
  paymentMethod: (row.payment_method || row.paymentMethod || 'UPI'),
  amount: Number(row.amount || 0),
  paidBy: (row.paid_by || row.paidBy || 'Company'),
  reimbursementStatus: (row.reimbursement_status || row.reimbursementStatus || 'Not Applicable'),
  reimbursementAmount: (row.reimbursement_amount !== null && row.reimbursement_amount !== undefined)
    ? Number(row.reimbursement_amount)
    : (row.reimbursementAmount !== undefined ? Number(row.reimbursementAmount) : undefined),
  reimbursedDate: row.reimbursed_date || row.reimbursedDate || undefined,
  notes: row.notes ? String(row.notes) : undefined,
  receipt: row.receipt ? String(row.receipt) : undefined,
});

// Helper to convert a database row to an in-memory Category
export const fromDbCategory = (row: any): Category => ({
  id: String(row.id),
  name: String(row.name),
  color: String(row.color),
});

// Helper to convert an in-memory Category to a database row
export const toDbCategory = (cat: Category) => ({
  id: cat.id,
  name: cat.name,
  color: cat.color,
});

// Helper to convert a database row to in-memory Settings
export const fromDbSettings = (row: any): Settings => ({
  companyName: row.company_name || 'Acutix Soft LLP',
  defaultCurrency: row.default_currency || 'INR',
  financialYearStartMonth: Number(row.financial_year_start_month ?? 4),
  appearance: row.appearance || 'light',
  notificationsEnabled: row.notifications_enabled ?? true,
});

// Helper to convert in-memory Settings to a database row
export const toDbSettings = (s: Settings) => ({
  id: 'default',
  company_name: s.companyName,
  default_currency: s.defaultCurrency,
  financial_year_start_month: s.financialYearStartMonth,
  appearance: s.appearance || 'light',
  notifications_enabled: s.notificationsEnabled ?? true,
  updated_at: new Date().toISOString(),
});
