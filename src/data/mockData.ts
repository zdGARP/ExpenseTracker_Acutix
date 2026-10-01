import type { Expense, Category, Settings } from '../types';
import { subDays, format } from 'date-fns';

const today = new Date();

export const DEFAULT_SETTINGS: Settings = {
  companyName: 'Acutix Soft LLP',
  defaultCurrency: 'INR',
  financialYearStartMonth: 4,
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Office Supplies', color: '#EAF2FF' }, // Soft Blue
  { id: 'c2', name: 'Travel', color: '#DFF5EF' }, // Soft Teal
  { id: 'c3', name: 'Food & Meals', color: '#FFE8E1' }, // Soft Coral (Orange)
  { id: 'c4', name: 'Transportation', color: '#E6F4EA' }, // Soft Green
  { id: 'c5', name: 'Software & Subscriptions', color: '#EEE9FF' }, // Soft Purple
  { id: 'c6', name: 'Marketing', color: '#FFE8E1' }, // Soft Coral
  { id: 'c7', name: 'Equipment', color: '#EEEDFF' }, // Soft Indigo
  { id: 'c8', name: 'Internet & Utilities', color: '#FFF3D6' }, // Soft Amber
  { id: 'c9', name: 'Client Expenses', color: '#FDE8ED' }, // Soft Pink
  { id: 'c10', name: 'Salaries / Staff Expenses', color: '#F3F4F6' }, // Soft Gray
  { id: 'c11', name: 'Client Entertainment', color: '#DFF5EF' }, // Soft Teal
  { id: 'c12', name: 'Miscellaneous', color: '#F3F4F6' } // Soft Gray
];

export const MOCK_EXPENSES: Expense[] = [];

export const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'HR',
  'Operations',
  'Finance',
  'Executive'
];

