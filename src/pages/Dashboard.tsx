import React, { useMemo } from 'react';
import { useExpenses, useCategories } from '../store/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import { 
  IndianRupee, 
  TrendingUp, 
  Calendar, 
  CreditCard,
  Tags,
  ArrowUpRight,
  Wallet,
  Clock,
  CheckCircle,
  Building2,
  Users
} from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  const { expenses } = useExpenses();
  const { categories } = useCategories();
  const [timeFilter, setTimeFilter] = React.useState('All Time');

  const filteredExpenses = useMemo(() => {
    if (timeFilter === 'All Time') return expenses;
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');
    const monthStr = format(now, 'yyyy-MM');
    const yearStr = format(now, 'yyyy');
    const lastYearStr = (now.getFullYear() - 1).toString();

    return expenses.filter(exp => {
      if (timeFilter === 'Today') return exp.date.startsWith(todayStr);
      if (timeFilter === 'This Month') return exp.date.startsWith(monthStr);
      if (timeFilter === 'This Year') return exp.date.startsWith(yearStr);
      if (timeFilter === 'Last Year') return exp.date.startsWith(lastYearStr);
      return true;
    });
  }, [expenses, timeFilter]);

  const stats = useMemo(() => {
    let totalExpenses = 0;
    let companyPaid = 0;
    let employeePaid = 0;
    
    let owedToEmployees = 0;
    let reimbursedThisMonth = 0;
    let pendingApprovals = 0;
    let approvedNotReimbursed = 0;

    const currentMonthPrefix = format(new Date(), 'yyyy-MM');

    filteredExpenses.forEach((exp) => {
      // 1. Total Company Expenses
      totalExpenses += exp.amount;

      if (exp.paidBy === 'Company') {
        companyPaid += exp.amount;
      } else if (exp.paidBy === 'Employee') {
        employeePaid += exp.amount;
        
        const rAmount = exp.reimbursementAmount || 0;

        if (exp.reimbursementStatus === 'Pending Approval') {
          pendingApprovals += rAmount;
          owedToEmployees += rAmount;
        } else if (exp.reimbursementStatus === 'Approved') {
          approvedNotReimbursed += rAmount;
          owedToEmployees += rAmount;
        } else if (exp.reimbursementStatus === 'Reimbursed') {
          // Check if it was reimbursed this month
          if (exp.reimbursedDate && exp.reimbursedDate.startsWith(currentMonthPrefix)) {
            reimbursedThisMonth += rAmount;
          }
        }
      }
    });

    const avg = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

    return {
      totalExpenses,
      companyPaid,
      employeePaid,
      owedToEmployees,
      reimbursedThisMonth,
      pendingApprovals,
      approvedNotReimbursed,
      count: filteredExpenses.length,
      avg
    };
  }, [filteredExpenses]);

  const employeeData = useMemo(() => {
    const data: Record<string, { pending: number, approved: number, reimbursed: number, owed: number }> = {};
    
    filteredExpenses.forEach(exp => {
      if (exp.paidBy === 'Employee') {
        const emp = exp.employee || 'Unknown';
        if (!data[emp]) data[emp] = { pending: 0, approved: 0, reimbursed: 0, owed: 0 };
        
        const rAmount = exp.reimbursementAmount || 0;
        
        if (exp.reimbursementStatus === 'Pending Approval') {
          data[emp].pending += rAmount;
          data[emp].owed += rAmount;
        } else if (exp.reimbursementStatus === 'Approved') {
          data[emp].approved += rAmount;
          data[emp].owed += rAmount;
        } else if (exp.reimbursementStatus === 'Reimbursed') {
          data[emp].reimbursed += rAmount;
        }
      }
    });
    
    return Object.entries(data).map(([name, stats]) => ({
      name,
      ...stats
    })).sort((a, b) => b.owed - a.owed);
  }, [filteredExpenses]);

  const monthlyData = useMemo(() => {
    const data: Record<string, { company: number, employee: number }> = {};
    filteredExpenses.forEach(exp => {
      const month = exp.date.substring(0, 7); // yyyy-MM
      if (!data[month]) data[month] = { company: 0, employee: 0 };
      
      if (exp.paidBy === 'Company') {
        data[month].company += exp.amount;
      } else {
        data[month].employee += exp.amount;
      }
    });
    return Object.keys(data).sort().map(key => {
      const date = parseISO(key + '-01');
      return {
        name: format(date, 'MMM yyyy'),
        company: data[key].company,
        employee: data[key].employee
      };
    }).slice(-6);
  }, [filteredExpenses]);

  const KPICard = ({ title, value, icon, subtitle, trend, accentBg, accentText }: any) => (
    <div className="card flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${accentBg} ${accentText}`}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-semibold text-[var(--success-text)] bg-[var(--success-bg)] px-2 py-1 rounded-full">
            <ArrowUpRight size={12} /> {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-[var(--text-secondary)] font-medium text-sm mb-1">{title}</div>
        <div className="text-2xl font-bold text-[var(--text-main)] tracking-tight">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] mb-1">Expense Overview</h1>
          <p className="text-[var(--text-secondary)] text-sm">Track company spending and manage employee reimbursements.</p>
        </div>
        <select 
          className="form-control w-auto bg-[var(--surface-color)] shadow-sm border-none"
          value={timeFilter}
          onChange={e => setTimeFilter(e.target.value)}
        >
          <option>Today</option>
          <option>This Month</option>
          <option>This Year</option>
          <option>Last Year</option>
          <option>All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Company Expenses" 
          value={formatCurrency(stats.totalExpenses)} 
          icon={<IndianRupee size={20} />}
          accentBg="bg-gray-100"
          accentText="text-gray-800"
        />
        <KPICard 
          title="Owed to Employees" 
          value={formatCurrency(stats.owedToEmployees)} 
          icon={<Wallet size={20} />}
          accentBg="bg-[var(--pastel-coral)]"
          accentText="text-orange-600"
        />
        <KPICard 
          title="Pending Approvals" 
          value={formatCurrency(stats.pendingApprovals)} 
          icon={<Clock size={20} />}
          accentBg="bg-amber-100"
          accentText="text-amber-600"
        />
        <KPICard 
          title="Reimbursed This Month" 
          value={formatCurrency(stats.reimbursedThisMonth)} 
          icon={<CheckCircle size={20} />}
          accentBg="bg-[var(--success-bg)]"
          accentText="text-[var(--success-text)]"
        />
      </div>

      <div className="dashboard-layout !gap-6">
        {/* Main Chart */}
        <div className="dashboard-main bg-white rounded-[var(--radius-lg)] shadow-sm border border-[var(--border-color)] p-6">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
            Spending Trend 
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Company vs Employee Paid</span>
          </h3>
          <div className="h-[300px]">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: 'var(--surface-hover)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name === 'company' ? 'Company Paid' : 'Employee Paid']}
                  />
                  <Bar dataKey="company" stackId="a" fill="var(--primary)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="employee" stackId="a" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] bg-[var(--surface-hover)] rounded-xl">
                No expense data available for trend
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Employee Reimbursements */}
        <div className="dashboard-sidebar bg-white rounded-[var(--radius-lg)] shadow-sm border border-[var(--border-color)] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Reimbursements</h3>
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
            {employeeData.length > 0 ? (
              employeeData.map(emp => (
                <div key={emp.name} className="flex flex-col gap-1.5 p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-light)] transition-colors hover:bg-gray-100/80 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-gray-800">{emp.name}</span>
                    <span className="font-bold text-orange-600 text-sm">Owes: {formatCurrency(emp.owed)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <div className="flex flex-col">
                      <span className="text-gray-400">Pending</span>
                      <span className="font-medium text-amber-600">{formatCurrency(emp.pending)}</span>
                    </div>
                    <div className="flex flex-col text-center">
                      <span className="text-gray-400">Approved</span>
                      <span className="font-medium text-blue-600">{formatCurrency(emp.approved)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-gray-400">Reimbursed</span>
                      <span className="font-medium text-green-600">{formatCurrency(emp.reimbursed)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] text-center py-8">
                <Users size={32} className="mb-2 text-gray-300" />
                <span className="text-sm font-medium">No employee reimbursements</span>
                <span className="text-xs mt-1">Expenses paid directly by the company don't require reimbursement.</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
