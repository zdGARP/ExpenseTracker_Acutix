import React, { useState, useEffect } from 'react';
import { useExpenses, useCategories } from '../store/ExpenseContext';
import type { Expense, PaymentMethod, ReimbursementStatus, PaidBy } from '../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, CalendarIcon, Wallet, CreditCard, FileText, Clock } from 'lucide-react';

interface EditExpenseModalProps {
  expenseId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ expenseId, onClose, onSuccess }) => {
  const { expenses, updateExpense } = useExpenses();
  const { categories } = useCategories();
  
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [reimbursedDate, setReimbursedDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState<any>({
    category: '',
    paymentMethod: 'UPI',
    amount: '',
    employee: '',
    description: '',
    vendor: '',
    notes: '',
    paidBy: 'Company',
    reimbursementStatus: 'Not Applicable',
    reimbursementAmount: ''
  });

  useEffect(() => {
    if (expenseId) {
      const exp = expenses.find(e => e.id === expenseId);
      if (exp) {
        setFormData({
          category: exp.category,
          paymentMethod: exp.paymentMethod,
          amount: exp.amount,
          employee: exp.employee,
          description: exp.description,
          vendor: exp.vendor,
          notes: exp.notes || '',
          paidBy: exp.paidBy || 'Company',
          reimbursementStatus: exp.reimbursementStatus || 'Not Applicable',
          reimbursementAmount: exp.reimbursementAmount === undefined ? '' : exp.reimbursementAmount,
        });
        try {
          const loadedDate = new Date(exp.date);
          setDate(loadedDate);
          setTime(loadedDate);
          if (exp.reimbursedDate) {
            setReimbursedDate(new Date(exp.reimbursedDate));
          }
        } catch(e) {}
      }
    }
  }, [expenseId, expenses]);

  if (!expenseId) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => {
      let parsedValue: any = value;
      if (name.includes('amount') || name.includes('Amount')) {
        parsedValue = value === '' ? '' : Number(value);
      }
      
      const newData = { ...prev, [name]: parsedValue };
      if (name === 'paidBy') {
        if (value === 'Company') {
          newData.reimbursementStatus = 'Not Applicable';
          newData.reimbursementAmount = '';
        } else {
          newData.reimbursementStatus = 'Pending Approval';
          newData.reimbursementAmount = newData.amount === '' ? '' : newData.amount;
        }
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount === '' || formData.amount <= 0) return;
    if (!formData.description) return;
    if (formData.paidBy === 'Employee' && !formData.employee) return;

    const finalDate = new Date(date);
    finalDate.setHours(time.getHours(), time.getMinutes(), 0, 0);

    let rDateString = undefined;
    if (formData.reimbursementStatus === 'Reimbursed' && reimbursedDate) {
      rDateString = `${reimbursedDate.getFullYear()}-${String(reimbursedDate.getMonth() + 1).padStart(2, '0')}-${String(reimbursedDate.getDate()).padStart(2, '0')}`;
    }

    const updatedExpense: Expense = {
      id: expenseId,
      date: finalDate.toISOString(),
      employee: formData.employee as string,
      category: formData.category as string,
      description: formData.description as string,
      vendor: formData.vendor as string,
      paymentMethod: formData.paymentMethod as PaymentMethod,
      amount: formData.amount as number,
      paidBy: formData.paidBy as PaidBy,
      reimbursementStatus: formData.reimbursementStatus as ReimbursementStatus,
      reimbursementAmount: formData.reimbursementAmount === '' ? undefined : formData.reimbursementAmount,
      reimbursedDate: rDateString,
      notes: formData.notes
    };

    updateExpense(updatedExpense);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
      <div className="bg-[var(--surface-color)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] w-full max-w-2xl max-h-[90vh] flex flex-col border border-[var(--border-color)]">
        
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--surface-accent)] rounded-t-[var(--radius-lg)] shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-main)]">Edit Expense</h3>
            <p className="text-xs text-[var(--text-secondary)] font-mono">{expenseId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-colors text-[var(--text-secondary)]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="edit-expense-form" onSubmit={handleSubmit}>
            
            <div className="mb-6 pb-6 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={16} className="text-[var(--primary)]" />
                <h4 className="font-semibold text-gray-800">Expense Details</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group relative">
                  <label className="form-label">Expense Date</label>
                  <div className="relative flex items-center">
                    <CalendarIcon className="absolute left-3 text-[var(--text-muted)] pointer-events-none z-10" size={16} />
                    <DatePicker selected={date} onChange={(d: Date) => setDate(d)} dateFormat="dd/MM/yyyy" className="form-control pl-9 text-sm" required />
                  </div>
                </div>
                <div className="form-group relative">
                  <label className="form-label">Expense Time</label>
                  <div className="relative flex items-center">
                    <Clock className="absolute left-3 text-[var(--text-muted)] pointer-events-none z-10" size={16} />
                    <DatePicker
                      selected={time}
                      onChange={(t: Date) => setTime(t)}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Time"
                      dateFormat="hh:mm aa"
                      placeholderText="Select time"
                      className="form-control pl-9 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label">Submitted By</label>
                  <input type="text" name="employee" className="form-control text-sm" value={formData.employee} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select name="category" className="form-control text-sm" value={formData.category} onChange={handleChange} required>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Total Amount (₹)</label>
                  <input type="number" name="amount" className="form-control text-sm font-semibold" value={formData.amount} onChange={handleChange} onWheel={(e) => (e.target as HTMLInputElement).blur()} min="0" step="0.01" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" name="description" className="form-control text-sm" value={formData.description} onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={16} className="text-teal-600" />
                <h4 className="font-semibold text-gray-800">Payment Details</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label">Vendor</label>
                  <input type="text" name="vendor" className="form-control text-sm" value={formData.vendor} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select name="paymentMethod" className="form-control text-sm" value={formData.paymentMethod} onChange={handleChange}>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Paid By</label>
                <select name="paidBy" className="form-control text-sm font-medium text-blue-900 bg-blue-50" value={formData.paidBy} onChange={handleChange}>
                  <option value="Company">Company</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2 mb-4">
                <Wallet size={16} className="text-orange-600" />
                <h4 className="font-semibold text-gray-800">Reimbursement</h4>
              </div>
              
              {formData.paidBy === 'Company' ? (
                <div className="form-group">
                  <label className="form-label text-gray-500">Reimbursement Status</label>
                  <input type="text" className="form-control text-sm bg-gray-50 text-gray-500" value="Not Applicable" disabled />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="form-group">
                      <label className="form-label">Employee</label>
                      <input type="text" className="form-control text-sm bg-gray-50" value={formData.employee} readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select name="reimbursementStatus" className="form-control text-sm" value={formData.reimbursementStatus} onChange={handleChange}>
                        <option value="Pending Approval">Pending Approval</option>
                        <option value="Approved">Approved</option>
                        <option value="Reimbursed">Reimbursed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Amount (₹)</label>
                      <input type="number" name="reimbursementAmount" className="form-control text-sm" value={formData.reimbursementAmount} onChange={handleChange} onWheel={(e) => (e.target as HTMLInputElement).blur()} min="0" step="0.01" />
                    </div>
                    {formData.reimbursementStatus === 'Reimbursed' && (
                      <div className="form-group relative">
                        <label className="form-label">Date</label>
                        <div className="relative flex items-center">
                          <CalendarIcon className="absolute left-3 text-[var(--text-muted)] pointer-events-none z-10" size={16} />
                          <DatePicker selected={reimbursedDate || new Date()} onChange={(d: Date) => setReimbursedDate(d)} dateFormat="dd/MM/yyyy" className="form-control pl-9 text-sm" required />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea name="notes" className="form-control text-sm" value={formData.notes} onChange={handleChange} rows={2}></textarea>
            </div>
            
          </form>
        </div>

        <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end gap-3 bg-[var(--surface-color)] shrink-0 rounded-b-[var(--radius-lg)]">
          <button type="button" className="btn btn-secondary px-5" onClick={onClose}>Cancel</button>
          <button type="submit" form="edit-expense-form" className="btn btn-primary px-6 shadow-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
