import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses, useCategories } from '../store/ExpenseContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { format } from 'date-fns';
import { Search, Filter, X, Trash2, Edit2, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, User, Building2, CheckCircle, FileText, Plus } from 'lucide-react';
import EditExpenseModal from '../components/EditExpenseModal';
import Calculator from '../components/Calculator';

type SortField = 'date' | 'employee' | 'amount' | 'status' | 'paidBy';
type SortDirection = 'asc' | 'desc';

const Expenses: React.FC = () => {
  const { expenses, deleteExpense } = useExpenses();
  const { categories } = useCategories();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  const [editModalId, setEditModalId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paidByFilter, setPaidByFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(exp => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        exp.description.toLowerCase().includes(searchLower) ||
        exp.id.toLowerCase().includes(searchLower) ||
        exp.employee.toLowerCase().includes(searchLower) ||
        exp.vendor.toLowerCase().includes(searchLower) ||
        exp.category.toLowerCase().includes(searchLower) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;
      if (categoryFilter && exp.category !== categoryFilter) return false;
      if (statusFilter && exp.reimbursementStatus !== statusFilter) return false;
      if (paidByFilter && exp.paidBy !== paidByFilter) return false;
      return true;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === 'amount') comparison = a.amount - b.amount;
      else if (sortField === 'status') comparison = a.reimbursementStatus.localeCompare(b.reimbursementStatus);
      else if (sortField === 'paidBy') comparison = a.paidBy.localeCompare(b.paidBy);
      else if (sortField === 'employee') comparison = a.employee.localeCompare(b.employee);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [expenses, searchTerm, categoryFilter, statusFilter, paidByFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  
  // Ensure current page is valid when filtering reduces results
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  
  const paginatedExpenses = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, validCurrentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={14} className="inline ml-1 text-gray-400" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="inline ml-1 text-gray-700" /> : <ChevronDown size={14} className="inline ml-1 text-gray-700" />;
  };

  const clearFilters = () => {
    setSearchTerm(''); setCategoryFilter(''); setStatusFilter(''); setPaidByFilter('');
  };

  const getCategoryColor = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    return cat ? cat.color : '#94A3B8';
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let bgClass = "bg-gray-100 text-gray-600";
    if (status === 'Reimbursed') bgClass = "bg-[var(--success-bg)] text-[var(--success-text)]";
    else if (status === 'Pending Approval') bgClass = "bg-amber-100 text-amber-800";
    else if (status === 'Approved') bgClass = "bg-blue-100 text-blue-800";
    else if (status === 'Rejected') bgClass = "bg-[var(--danger-bg)] text-[var(--danger)]";
    
    return <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${bgClass}`}>{status}</span>;
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteExpense(deleteConfirmId);
      showToast('Expense deleted successfully.');
      setDeleteConfirmId(null);
    }
  };

  return (
    <div>
      <div className="page-header flex justify-between items-start mb-6">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">Manage and track company expenses and reimbursements</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/add-expense')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0F9F8F] hover:bg-[#0c8678] text-white rounded-xl shadow-sm hover:shadow-md transition-all font-medium text-sm active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
          <Calculator />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button className="btn btn-secondary text-xs py-1.5 px-3 rounded-full" onClick={() => { clearFilters(); }}>All Expenses</button>
        <button className="btn btn-secondary text-xs py-1.5 px-3 rounded-full" onClick={() => { clearFilters(); setPaidByFilter('Company'); }}>Company Paid</button>
        <button className="btn btn-secondary text-xs py-1.5 px-3 rounded-full" onClick={() => { clearFilters(); setPaidByFilter('Employee'); }}>Employee Paid</button>
        <button className="btn btn-secondary text-xs py-1.5 px-3 rounded-full" onClick={() => { clearFilters(); setStatusFilter('Pending Approval'); }}>Awaiting Approval</button>
        <button className="btn btn-secondary text-xs py-1.5 px-3 rounded-full" onClick={() => { clearFilters(); setStatusFilter('Reimbursed'); }}>Reimbursed</button>
      </div>

      <div className="card mb-6 p-0 overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-2.5 text-[var(--text-muted)]" size={20} />
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search by Description, Employee, Vendor, ID, Notes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
              Filters { (categoryFilter || statusFilter || paidByFilter) && ' (Active)' }
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="form-row p-4 bg-[var(--surface-hover)] border-b border-[var(--border-color)] text-sm">
            <div>
              <label className="form-label">Paid By</label>
              <select className="form-control text-sm" value={paidByFilter} onChange={(e) => setPaidByFilter(e.target.value)}>
                <option value="">All</option>
                <option value="Company">Company</option>
                <option value="Employee">Employee</option>
              </select>
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="form-control text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Reimbursement Status</label>
              <select className="form-control text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Not Applicable">Not Applicable</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Reimbursed">Reimbursed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn btn-secondary w-full" onClick={clearFilters}>
                <X size={18} /> Clear Filters
              </button>
            </div>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          {filteredExpenses.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-secondary)]">
              <p className="mb-4">No expenses found matching your criteria.</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--surface-accent)] border-b border-gray-200">
                  <th className="p-3 pl-6 cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('date')}>
                    Date <SortIcon field="date" />
                  </th>
                  <th className="p-3 cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('employee')}>
                    Submitted By <SortIcon field="employee" />
                  </th>
                  <th className="p-3">Expense Details</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort('amount')}>
                    Amount <SortIcon field="amount" />
                  </th>
                  <th className="p-3">Reimbursement Info</th>
                  <th className="p-3 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedExpenses.map((exp) => {
                  const isEmployeePaid = exp.paidBy === 'Employee';
                  const owesAmount = isEmployeePaid && ['Pending Approval', 'Approved'].includes(exp.reimbursementStatus) ? (exp.reimbursementAmount || 0) : 0;
                  
                  return (
                    <tr 
                      key={exp.id} 
                      className="border-b border-gray-200 transition-colors hover:shadow-sm" 
                      style={{ backgroundColor: getCategoryColor(exp.category) + '15' }}
                    >
                      <td className="p-3 pl-6 whitespace-nowrap align-top pt-4">
                        <div className="font-medium text-gray-700">{formatDate(exp.date)}</div>
                        <div className="text-xs text-gray-500 mt-1">{format(new Date(exp.date), 'hh:mm a')}</div>
                      </td>
                      <td className="p-3 align-top pt-4 font-medium text-gray-800">{exp.employee}</td>
                      <td className="p-3 align-top pt-4">
                        <div className="font-semibold text-gray-900 max-w-[250px] truncate" title={exp.description}>
                          {exp.description}
                        </div>
                        {exp.notes && (
                          <div className="text-xs text-gray-500 mt-1.5 flex items-start gap-1 max-w-[250px]">
                            <FileText size={12} className="mt-0.5 shrink-0" />
                            <span className="truncate" title={exp.notes}>{exp.notes}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 align-top pt-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(exp.category) }}></div>
                          {exp.category}
                        </div>
                      </td>
                      <td className="p-3 text-right align-top pt-4">
                        <div className="font-semibold text-gray-900 text-lg">{formatCurrency(exp.amount)}</div>
                      </td>
                      <td className="p-3 align-top pt-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${isEmployeePaid ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {isEmployeePaid ? <User size={12} /> : <Building2 size={12} />}
                            {isEmployeePaid ? 'Employee Paid' : 'Company Paid'}
                          </div>
                          
                          {isEmployeePaid ? (
                            <>
                              <StatusBadge status={exp.reimbursementStatus} />
                              {owesAmount > 0 ? (
                                <div className="text-xs font-bold text-orange-600 mt-0.5">Owes: {formatCurrency(owesAmount)}</div>
                              ) : exp.reimbursementStatus === 'Reimbursed' ? (
                                <div className="text-xs font-bold text-green-600 mt-0.5">Settled</div>
                              ) : null}
                            </>
                          ) : (
                            <div className="text-xs text-gray-400 font-medium italic mt-1">— No Reimbursement —</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 pr-6 align-top pt-4">
                        <div className="flex gap-2 justify-center">
                          <button 
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 bg-white shadow-sm" 
                            title="Edit expense"
                            onClick={() => setEditModalId(exp.id)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 bg-white shadow-sm" 
                            title="Delete expense"
                            onClick={() => setDeleteConfirmId(exp.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {filteredExpenses.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(validCurrentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(validCurrentPage * itemsPerPage, filteredExpenses.length)}</span> of <span className="font-medium">{filteredExpenses.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-sm font-medium text-gray-700 px-2">
                Page {validCurrentPage} of {totalPages}
              </div>
              <button 
                className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage === totalPages || totalPages === 0}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <EditExpenseModal 
        expenseId={editModalId} 
        onClose={() => setEditModalId(null)}
        onSuccess={() => showToast('Expense updated successfully.')}
      />

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-[var(--surface-color)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-6 max-w-sm w-full mx-4 border border-[var(--border-color)]">
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Delete Expense?</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Are you sure you want to delete {deleteConfirmId}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary px-5" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="btn bg-[var(--danger)] text-white hover:bg-red-600 px-5 shadow-sm" onClick={confirmDelete}>Delete Expense</button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[var(--surface-color)] border border-[var(--border-color)] shadow-[var(--shadow-lg)] rounded-[var(--radius-md)] px-4 py-3 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <div className="w-6 h-6 rounded-full bg-[var(--success-bg)] text-[var(--success-text)] flex items-center justify-center">
            <CheckCircle size={14} />
          </div>
          <span className="font-medium text-[var(--text-main)]">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Expenses;
