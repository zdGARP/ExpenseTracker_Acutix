export type ReimbursementStatus = 'Not Applicable' | 'Pending Approval' | 'Approved' | 'Reimbursed' | 'Rejected';
export type PaymentMethod = 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Other';
export type PaidBy = 'Company' | 'Employee';

export interface Expense {
  id: string;
  date: string;
  employee: string;
  department?: string;
  category: string;
  description: string;
  vendor: string;
  paymentMethod: PaymentMethod;
  amount: number;
  
  // New Reimbursement System Fields
  paidBy: PaidBy;
  reimbursementStatus: ReimbursementStatus;
  reimbursementAmount?: number;
  reimbursedDate?: string;
  
  notes?: string;
  receipt?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Settings {
  companyName: string;
  defaultCurrency: string;
  financialYearStartMonth: number;
  appearance?: string;
  notificationsEnabled?: boolean;
}

export interface NotificationItem {
  id: string;
  text: string;
  time: string;
  read: boolean;
}
