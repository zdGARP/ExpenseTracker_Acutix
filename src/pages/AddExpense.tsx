import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExpenses, useCategories } from '../store/ExpenseContext';
import type { Expense, ReimbursementStatus, PaymentMethod, PaidBy } from '../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon, CheckCircle, FileText, CreditCard, Paperclip, Wallet, Clock } from 'lucide-react';
import Calculator from '../components/Calculator';

const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { expenses, addExpense, updateExpense } = useExpenses();
  const { categories } = useCategories();
  const isEditing = Boolean(id);

  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [reimbursedDate, setReimbursedDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState<any>({
    category: categories.length > 0 ? categories[0].name : '',
    paymentMethod: 'UPI',
    amount: '',
    employee: '',
    description: '',
    vendor: '',
    notes: '',
    paidBy: 'Company',
    reimbursementStatus: 'Not Applicable',
    reimbursementAmount: '',
    receipt: ''
  });

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      const existing = expenses.find(e => e.id === id);
      if (existing) {
        setFormData({
          category: existing.category,
          paymentMethod: existing.paymentMethod,
          amount: existing.amount,
          employee: existing.employee,
          description: existing.description,
          vendor: existing.vendor,
          notes: existing.notes || '',
          paidBy: existing.paidBy || 'Company',
          reimbursementStatus: existing.reimbursementStatus || 'Not Applicable',
          reimbursementAmount: existing.reimbursementAmount === undefined ? '' : existing.reimbursementAmount,
        });
        try {
          const loadedDate = new Date(existing.date);
          setDate(loadedDate);
          setTime(loadedDate);
          if (existing.reimbursedDate) {
            setReimbursedDate(new Date(existing.reimbursedDate));
          }
        } catch(e) {}
      }
    }
  }, [isEditing, id, expenses]);

  useEffect(() => {
    if (!formData.category && categories.length > 0) {
      setFormData((prev: any) => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, formData.category]);

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
    
    if (formData.amount === '' || formData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!formData.description) {
      alert('Description is required');
      return;
    }
    if (formData.paidBy === 'Employee' && !formData.employee) {
      alert('Employee is required for reimbursements.');
      return;
    }

    const finalDate = new Date(date);
    finalDate.setHours(time.getHours(), time.getMinutes(), 0, 0);

    let rDateString = undefined;
    if (formData.reimbursementStatus === 'Reimbursed' && reimbursedDate) {
      rDateString = `${reimbursedDate.getFullYear()}-${String(reimbursedDate.getMonth() + 1).padStart(2, '0')}-${String(reimbursedDate.getDate()).padStart(2, '0')}`;
    }

    const expenseData: Omit<Expense, 'id'> = {
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

    if (isEditing && id) {
      updateExpense({ ...expenseData, id });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/expenses');
      }, 1500);
    } else {
      addExpense(expenseData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/expenses');
      }, 1500);
    }
  };

  return (
    <div>
      <div className="page-header flex justify-between items-start mb-6">
        <div>
          <h1 className="page-title">{isEditing ? 'Edit Expense' : 'Add Expense'}</h1>
          <p className="page-subtitle">{isEditing ? `Updating details for ${id}` : 'Record a new company expense'}</p>
        </div>
        <Calculator onUseResult={(val) => setFormData((prev: any) => ({ ...prev, amount: val, reimbursementAmount: prev.paidBy === 'Employee' ? val : prev.reimbursementAmount }))} />
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          
          {/* SECTION A: EXPENSE DETAILS */}
          <div className="form-section">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[var(--border-light)]">
              <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                <FileText size={16} />
              </div>
              <h3 className="text-lg font-semibold m-0 text-[var(--text-main)]">Expense Details</h3>
            </div>
            
            <div className="form-row mb-4">
              <div className="form-group relative">
                <label className="form-label">Expense Date</label>
                <div className="relative flex items-center">
                  <CalendarIcon className="absolute left-3 text-[var(--text-muted)] pointer-events-none z-10" size={18} />
                  <DatePicker
                    selected={date}
                    onChange={(d: Date) => setDate(d)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control pl-10"
                    required
                  />
                </div>
              </div>
              <div className="form-group relative">
                <label className="form-label">Expense Time</label>
                <div className="relative flex items-center">
                  <Clock className="absolute left-3 text-[var(--text-muted)] pointer-events-none z-10" size={18} />
                  <DatePicker
                    selected={time}
                    onChange={(t: Date) => setTime(t)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="hh:mm aa"
                    placeholderText="Select time"
                    className="form-control pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row mb-4">
              <div className="form-group">
                <label className="form-label">Employee / Submitted By</label>
                <input type="text" name="employee" className="form-control" value={formData.employee} onChange={handleChange} placeholder="e.g. Abinav" required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" className="form-control" value={formData.category} onChange={handleChange} required>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row mb-4">
              <div className="form-group w-full" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <input type="text" name="description" className="form-control" value={formData.description} onChange={handleChange} placeholder="Printing documents for company meeting" required />
              </div>
            </div>

            <div className="form-row mb-2">
              <div className="form-group">
                <label className="form-label text-lg font-semibold text-gray-800">Total Amount (₹)</label>
                <input 
                  type="number" 
                  name="amount" 
                  className="form-control text-lg font-semibold" 
                  value={formData.amount} 
                  onChange={handleChange} 
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  min="0" 
                  step="0.01" 
                  required 
                />
                <p className="text-xs text-gray-500 mt-1">This is the TOTAL COMPANY EXPENSE.</p>
              </div>
            </div>
          </div>

          {/* SECTION B: PAYMENT DETAILS */}
          <div className="form-section">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[var(--border-light)]">
              <div className="w-8 h-8 rounded-full bg-[var(--pastel-teal)] text-teal-700 flex items-center justify-center">
                <CreditCard size={16} />
              </div>
              <h3 className="text-lg font-semibold m-0 text-[var(--text-main)]">Payment Details</h3>
            </div>
            
            <div className="form-row mb-4">
              <div className="form-group">
                <label className="form-label">Vendor / Merchant</label>
                <input type="text" name="vendor" className="form-control" value={formData.vendor} onChange={handleChange} placeholder="e.g. Sunshine Printers" required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select name="paymentMethod" className="form-control" value={formData.paymentMethod} onChange={handleChange}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row mb-2">
              <div className="form-group">
                <label className="form-label">Paid By</label>
                <select name="paidBy" className="form-control font-medium text-blue-900 bg-blue-50" value={formData.paidBy} onChange={handleChange}>
                  <option value="Company">Company</option>
                  <option value="Employee">Employee</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Whose money was actually used to pay the vendor?</p>
              </div>
            </div>
          </div>

          {/* SECTION C: REIMBURSEMENT */}
          <div className="form-section">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[var(--border-light)]">
              <div className="w-8 h-8 rounded-full bg-[var(--pastel-coral)] text-orange-700 flex items-center justify-center">
                <Wallet size={16} />
              </div>
              <h3 className="text-lg font-semibold m-0 text-[var(--text-main)]">Reimbursement</h3>
            </div>

            {formData.paidBy === 'Company' ? (
              <div className="form-row mb-2">
                <div className="form-group">
                  <label className="form-label text-gray-500">Reimbursement Status</label>
                  <input type="text" className="form-control bg-gray-50 text-gray-500" value="Not Applicable" disabled />
                  <p className="text-xs text-gray-500 mt-2">The company paid this expense directly.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="form-row mb-4">
                  <div className="form-group">
                    <label className="form-label">Employee</label>
                    <input type="text" className="form-control bg-gray-50" value={formData.employee} readOnly title="Matches Submitted By" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reimbursement Status</label>
                    <select name="reimbursementStatus" className="form-control" value={formData.reimbursementStatus} onChange={handleChange}>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Reimbursed">Reimbursed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row mb-2">
                  <div className="form-group">
                    <label className="form-label">Reimbursement Amount (₹)</label>
                    <input type="number" name="reimbursementAmount" className="form-control" value={formData.reimbursementAmount} onChange={handleChange} onWheel={(e) => (e.target as HTMLInputElement).blur()} min="0" step="0.01" />
                  </div>
                  {formData.reimbursementStatus === 'Reimbursed' && (
                    <div className="form-group relative">
                      <label className="form-label">Reimbursed Date</label>
                      <div className="relative flex items-center">
                        <CalendarIcon className="absolute left-3 text-[var(--text-muted)] pointer-events-none z-10" size={18} />
                        <DatePicker
                          selected={reimbursedDate || new Date()}
                          onChange={(d: Date) => setReimbursedDate(d)}
                          dateFormat="dd/MM/yyyy"
                          className="form-control pl-10"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* SECTION D: ADDITIONAL INFORMATION */}
          <div className="form-section">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[var(--border-light)]">
              <div className="w-8 h-8 rounded-full bg-[var(--pastel-purple)] text-purple-700 flex items-center justify-center">
                <Paperclip size={16} />
              </div>
              <h3 className="text-lg font-semibold m-0 text-[var(--text-main)]">Additional Information</h3>
            </div>
            
            <div className="form-group mb-4">
              <label className="form-label">Notes (Optional)</label>
              <textarea name="notes" className="form-control" value={formData.notes} onChange={handleChange} rows={2} placeholder="Manager requested printed copies for client meeting."></textarea>
            </div>
            
            <div className="form-group mb-2">
              <label className="form-label">Receipt / Invoice</label>
              <div className="p-8 border-2 border-dashed border-[var(--border-color)] rounded-2xl text-center bg-[var(--surface-hover)] transition-colors hover:bg-[var(--border-light)] cursor-pointer relative">
                 <p className="text-[var(--text-secondary)] font-medium mb-1">
                   {formData.receipt ? `Selected File: ${formData.receipt}` : 'Drag and drop file here, or click to upload'}
                 </p>
                 <p className="text-xs text-[var(--text-muted)]">Supported formats: JPG, PNG, PDF up to 5MB</p>
                 <input 
                   type="file" 
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                   onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       setFormData(prev => ({ ...prev, receipt: file.name }));
                     }
                   }}
                 />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 mb-8">
            <div>
              {success && (
                <div className="flex items-center gap-2 text-sm text-[var(--success-text)] bg-[var(--success-bg)] px-4 py-2 rounded-md font-medium shadow-sm">
                  <CheckCircle size={18} /> {isEditing ? 'Expense updated successfully!' : 'Expense saved successfully!'}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/expenses')}>Cancel</button>
              <button type="submit" className="btn btn-primary px-8">{isEditing ? 'Save Changes' : 'Add Expense'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
