import React, { useState, useMemo } from 'react';
import { useExpenses, useCategories } from '../store/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import { Download, FileSpreadsheet, CheckCircle, Filter, X, Building2, Wallet, Clock, CheckSquare } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Reports: React.FC = () => {
  const { expenses } = useExpenses();
  const { categories } = useCategories();
  
  const [isExporting, setIsExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Filters for Reports
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paidByFilter, setPaidByFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(''); 

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (categoryFilter && exp.category !== categoryFilter) return false;
      if (statusFilter && exp.reimbursementStatus !== statusFilter) return false;
      if (paidByFilter && exp.paidBy !== paidByFilter) return false;
      if (employeeFilter && !exp.employee.toLowerCase().includes(employeeFilter.toLowerCase())) return false;
      if (dateFilter && !exp.date.startsWith(dateFilter)) return false;
      return true;
    });
  }, [expenses, categoryFilter, statusFilter, paidByFilter, employeeFilter, dateFilter]);

  const clearFilters = () => {
    setCategoryFilter(''); setStatusFilter(''); setPaidByFilter(''); setEmployeeFilter(''); setDateFilter('');
  };

  const generateExcel = async (dataToExport = expenses, isFiltered = false) => {
    if (dataToExport.length === 0) {
      alert("No data available to export with the current filters.");
      return;
    }
    setIsExporting(true);
    setSuccess(false);
    
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Acutix Expense System';
      workbook.created = new Date();

      const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
      const headerFont: ExcelJS.Font = { color: { argb: 'FFFFFFFF' }, bold: true };
      const currencyFormat = '₹#,##0.00';
      const borderStyle: ExcelJS.Borders = {
        top: { style: 'thin', color: { argb: 'FFD4D4D4' } }, left: { style: 'thin', color: { argb: 'FFD4D4D4' } },
        bottom: { style: 'thin', color: { argb: 'FFD4D4D4' } }, right: { style: 'thin', color: { argb: 'FFD4D4D4' } }
      };

      // --- Sheet 1: Expense Details ---
      const wsDetails = workbook.addWorksheet(isFiltered ? 'Filtered Expenses' : 'Expense Details', { views: [{ state: 'frozen', ySplit: 1 }] });
      wsDetails.columns = [
        { header: 'Expense ID', key: 'id', width: 15 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Description', key: 'desc', width: 35 },
        { header: 'Category', key: 'cat', width: 25 },
        { header: 'Employee', key: 'employee', width: 25 },
        { header: 'Vendor', key: 'vendor', width: 20 },
        { header: 'Amount', key: 'amount', width: 15, style: { numFmt: currencyFormat } },
        { header: 'Payment Method', key: 'method', width: 18 },
        { header: 'Paid By', key: 'paidBy', width: 15 },
        { header: 'Reimbursement Status', key: 'reimbStatus', width: 20 },
        { header: 'Reimbursement Amount', key: 'reimbAmount', width: 20, style: { numFmt: currencyFormat } },
        { header: 'Amount Owed', key: 'owed', width: 15, style: { numFmt: currencyFormat } },
        { header: 'Reimbursed Date', key: 'rDate', width: 15 },
        { header: 'Notes', key: 'notes', width: 30 }
      ];

      wsDetails.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; cell.border = borderStyle; });
      wsDetails.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 14 } };

      dataToExport.forEach(exp => {
        const isEmp = exp.paidBy === 'Employee';
        const owesAmount = isEmp && ['Pending Approval', 'Approved'].includes(exp.reimbursementStatus) ? (exp.reimbursementAmount || 0) : 0;
        
        wsDetails.addRow({
          id: exp.id,
          date: exp.date.split('-').reverse().join('/'),
          desc: exp.description,
          cat: exp.category,
          employee: exp.employee,
          vendor: exp.vendor,
          amount: exp.amount,
          method: exp.paymentMethod,
          paidBy: exp.paidBy,
          reimbStatus: exp.reimbursementStatus,
          reimbAmount: exp.reimbursementAmount || 0,
          owed: owesAmount,
          rDate: exp.reimbursedDate ? exp.reimbursedDate.split('-').reverse().join('/') : '',
          notes: exp.notes || ''
        }).eachCell((cell) => { cell.border = borderStyle; });
      });

      // --- Sheet 2: Expense Summary ---
      let totalAmount = 0, companyPaid = 0, empPaid = 0, pending = 0, approved = 0, reimbursed = 0;
      dataToExport.forEach(e => {
        totalAmount += e.amount;
        if(e.paidBy === 'Company') companyPaid += e.amount;
        else {
          empPaid += e.amount;
          const rAmount = e.reimbursementAmount || 0;
          if (e.reimbursementStatus === 'Pending Approval') pending += rAmount;
          else if (e.reimbursementStatus === 'Approved') approved += rAmount;
          else if (e.reimbursementStatus === 'Reimbursed') reimbursed += rAmount;
        }
      });

      const wsSummary = workbook.addWorksheet('Expense Summary');
      wsSummary.columns = [{ header: 'Metric', key: 'metric', width: 35 }, { header: 'Value', key: 'value', width: 25 }];
      wsSummary.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; });

      const summaryData = [
        { metric: 'Total Company Expenses', value: totalAmount, curr: true },
        { metric: 'Company-Paid Expenses', value: companyPaid, curr: true },
        { metric: 'Employee-Paid Expenses', value: empPaid, curr: true },
        { metric: 'Total Reimbursement Amount (All Statuses)', value: pending + approved + reimbursed, curr: true },
        { metric: 'Total Amount Owed', value: pending + approved, curr: true },
        { metric: 'Pending Approval Amount', value: pending, curr: true },
        { metric: 'Approved Amount', value: approved, curr: true },
        { metric: 'Reimbursed Amount', value: reimbursed, curr: true },
        { metric: 'Number of Transactions', value: dataToExport.length, curr: false }
      ];

      summaryData.forEach(d => {
        const row = wsSummary.addRow({ metric: d.metric, value: d.value });
        if(d.curr) row.getCell(2).numFmt = currencyFormat;
        row.font = { bold: true };
      });

      // --- Sheet 3: Employee Reimbursements ---
      const wsEmp = workbook.addWorksheet('Employee Reimbursements');
      wsEmp.columns = [
        { header: 'Employee', key: 'emp', width: 25 },
        { header: 'Total Personal Payments', key: 'total', width: 25, style: { numFmt: currencyFormat } },
        { header: 'Pending Approval', key: 'pend', width: 20, style: { numFmt: currencyFormat } },
        { header: 'Approved', key: 'app', width: 20, style: { numFmt: currencyFormat } },
        { header: 'Reimbursed', key: 'reimb', width: 20, style: { numFmt: currencyFormat } },
        { header: 'Currently Owed', key: 'owed', width: 20, style: { numFmt: currencyFormat } }
      ];
      wsEmp.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; });

      const empMap: Record<string, any> = {};
      dataToExport.forEach(e => {
        if (e.paidBy === 'Employee' && e.employee) {
          if (!empMap[e.employee]) empMap[e.employee] = { total: 0, pend: 0, app: 0, reimb: 0 };
          empMap[e.employee].total += e.amount;
          const rAmount = e.reimbursementAmount || 0;
          if (e.reimbursementStatus === 'Pending Approval') empMap[e.employee].pend += rAmount;
          else if (e.reimbursementStatus === 'Approved') empMap[e.employee].app += rAmount;
          else if (e.reimbursementStatus === 'Reimbursed') empMap[e.employee].reimb += rAmount;
        }
      });
      Object.entries(empMap).forEach(([emp, stats]) => {
        wsEmp.addRow({ emp, total: stats.total, pend: stats.pend, app: stats.app, reimb: stats.reimb, owed: stats.pend + stats.app });
      });

      // --- Sheet 4: Category Summary ---
      const wsCat = workbook.addWorksheet('Category Summary');
      wsCat.columns = [
        { header: 'Category', key: 'cat', width: 25 },
        { header: 'Total Expenses', key: 'total', width: 20, style: { numFmt: currencyFormat } },
        { header: 'Company-Paid Amount', key: 'comp', width: 20, style: { numFmt: currencyFormat } },
        { header: 'Employee-Paid Amount', key: 'emp', width: 20, style: { numFmt: currencyFormat } },
        { header: 'Total Reimbursement Amount', key: 'reimb', width: 25, style: { numFmt: currencyFormat } }
      ];
      wsCat.getRow(1).eachCell((cell) => { cell.fill = headerFill; cell.font = headerFont; });

      const catMap: Record<string, any> = {};
      dataToExport.forEach(e => {
        if (!catMap[e.category]) catMap[e.category] = { total: 0, comp: 0, emp: 0, reimb: 0 };
        catMap[e.category].total += e.amount;
        if (e.paidBy === 'Company') catMap[e.category].comp += e.amount;
        else {
          catMap[e.category].emp += e.amount;
          catMap[e.category].reimb += (e.reimbursementAmount || 0);
        }
      });
      Object.entries(catMap).forEach(([cat, stats]) => {
        wsCat.addRow({ cat, total: stats.total, comp: stats.comp, emp: stats.emp, reimb: stats.reimb });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Acutix_${isFiltered ? 'Filtered' : 'Complete'}_Expense_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSuccess(true);
    } catch (error) {
      alert("Failed to export Excel file.");
    } finally {
      setIsExporting(false);
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  const previewStats = useMemo(() => {
    let total = 0, owed = 0, pending = 0, approved = 0, reimbursed = 0;
    filteredExpenses.forEach(e => {
      total += e.amount;
      if (e.paidBy === 'Employee') {
        const r = e.reimbursementAmount || 0;
        if (e.reimbursementStatus === 'Pending Approval') { pending += r; owed += r; }
        else if (e.reimbursementStatus === 'Approved') { approved += r; owed += r; }
        else if (e.reimbursementStatus === 'Reimbursed') { reimbursed += r; }
      }
    });
    return { total, owed, pending, approved, reimbursed };
  }, [filteredExpenses]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Export</h1>
          <p className="page-subtitle">Generate comprehensive Excel reports covering company spending and employee reimbursements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="card p-4 border border-[var(--border-light)] bg-white shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-gray-500 mb-1"><Building2 size={14} /> <span className="text-xs font-semibold">COMPANY TOTAL</span></div>
          <div className="text-xl font-bold">{formatCurrency(previewStats.total)}</div>
        </div>
        <div className="card p-4 border border-[var(--border-light)] bg-white shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-orange-600 mb-1"><Wallet size={14} /> <span className="text-xs font-semibold">TOTAL OWED</span></div>
          <div className="text-xl font-bold">{formatCurrency(previewStats.owed)}</div>
        </div>
        <div className="card p-4 border border-[var(--border-light)] bg-white shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-amber-600 mb-1"><Clock size={14} /> <span className="text-xs font-semibold">PENDING</span></div>
          <div className="text-xl font-bold">{formatCurrency(previewStats.pending)}</div>
        </div>
        <div className="card p-4 border border-[var(--border-light)] bg-white shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-blue-600 mb-1"><CheckSquare size={14} /> <span className="text-xs font-semibold">APPROVED</span></div>
          <div className="text-xl font-bold">{formatCurrency(previewStats.approved)}</div>
        </div>
        <div className="card p-4 border border-[var(--border-light)] bg-white shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-green-600 mb-1"><CheckCircle size={14} /> <span className="text-xs font-semibold">REIMBURSED</span></div>
          <div className="text-xl font-bold">{formatCurrency(previewStats.reimbursed)}</div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2"><Filter size={18} /> Filter Report Data</h3>
          {(categoryFilter || statusFilter || paidByFilter || employeeFilter || dateFilter) && (
            <button className="btn btn-secondary text-sm" onClick={clearFilters}><X size={16} /> Clear Filters</button>
          )}
        </div>
        <div className="form-row text-sm">
          <div>
            <label className="form-label">Paid By</label>
            <select className="form-control" value={paidByFilter} onChange={(e) => setPaidByFilter(e.target.value)}>
              <option value="">All</option><option value="Company">Company</option><option value="Employee">Employee</option>
            </select>
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="form-control" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Reimbursement Status</label>
            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Not Applicable">Not Applicable</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Reimbursed">Reimbursed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="form-label">Employee</label>
            <input type="text" className="form-control" placeholder="Name..." value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Month (YYYY-MM)</label>
            <input type="month" className="form-control" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid-cards mb-6">
        <div className="card border border-blue-100 bg-blue-50/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-[var(--pastel-blue)] text-blue-700 rounded-xl"><FileSpreadsheet size={32} /></div>
            <div>
              <h3 className="font-semibold text-lg text-[var(--text-main)]">Export Filtered Data</h3>
              <p className="text-[var(--text-secondary)] text-sm">Export ONLY the {filteredExpenses.length} matching records</p>
            </div>
          </div>
          <button className="btn btn-primary w-full shadow-sm" onClick={() => generateExcel(filteredExpenses, true)} disabled={isExporting || filteredExpenses.length === 0}>
            {isExporting ? 'Generating...' : <><Download size={18} /> Export Filtered Report</>}
          </button>
        </div>

        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-[var(--surface-hover)] text-[var(--text-secondary)] rounded-xl border border-[var(--border-color)]"><FileSpreadsheet size={32} /></div>
            <div>
              <h3 className="font-semibold text-lg text-[var(--text-main)]">Export Complete Data</h3>
              <p className="text-[var(--text-secondary)] text-sm">Export ALL {expenses.length} records, ignoring filters</p>
            </div>
          </div>
          <button className="btn btn-secondary w-full shadow-sm" onClick={() => generateExcel(expenses, false)} disabled={isExporting || expenses.length === 0}>
            <Download size={18} /> Export All Data
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-[var(--success-bg)] border border-[var(--success)] rounded-md flex items-center gap-2 text-[var(--success-text)] mt-4">
          <CheckCircle size={20} /><strong>✓ Excel report generated successfully</strong>
        </div>
      )}

      <div className="card mt-6 border-none bg-white shadow-sm">
        <h3 className="font-semibold mb-4 text-lg">What's included in the report?</h3>
        <ul className="text-secondary space-y-2 text-sm" style={{listStyleType: 'disc', paddingLeft: '1.5rem'}}>
          <li><strong>Sheet 1: Expense Details</strong> - Raw data with exact reimbursement breakdowns.</li>
          <li><strong>Sheet 2: Expense Summary</strong> - Total Company vs Employee spending and current liabilities (owed).</li>
          <li><strong>Sheet 3: Employee Reimbursements</strong> - Outstanding, approved, and settled amounts per employee.</li>
          <li><strong>Sheet 4: Category Summary</strong> - Spending grouped by category split by company vs employee paid.</li>
        </ul>
      </div>
    </div>
  );
};

export default Reports;
