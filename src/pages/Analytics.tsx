import React, { useMemo } from 'react';
import { useExpenses, useCategories } from '../store/ExpenseContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { formatCurrency } from '../utils/formatters';

const Analytics: React.FC = () => {
  const { expenses } = useExpenses();
  const { categories } = useCategories();

  const getCategoryColor = (catName: string) => {
    const cat = categories.find(c => c.name === catName);
    return cat ? cat.color : '#F3F4F6';
  };

  const totalSpending = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const payerData = useMemo(() => {
    let company = 0;
    let employee = 0;
    expenses.forEach(e => {
      if (e.paidBy === 'Company') company += e.amount;
      else employee += e.amount;
    });
    return [
      { name: 'Company Paid', value: company, color: '#3B82F6' },
      { name: 'Employee Paid', value: employee, color: '#14B8A6' }
    ].filter(d => d.value > 0);
  }, [expenses]);

  const lifecycleData = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let reimbursed = 0;
    expenses.forEach(e => {
      if (e.paidBy === 'Employee') {
        const r = e.reimbursementAmount || 0;
        if (e.reimbursementStatus === 'Pending Approval') pending += r;
        else if (e.reimbursementStatus === 'Approved') approved += r;
        else if (e.reimbursementStatus === 'Reimbursed') reimbursed += r;
      }
    });
    return [
      { stage: 'Pending Approval', amount: pending },
      { stage: 'Approved', amount: approved },
      { stage: 'Reimbursed', amount: reimbursed }
    ];
  }, [expenses]);

  const employeeOwedData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(e => {
      if (e.paidBy === 'Employee' && ['Pending Approval', 'Approved'].includes(e.reimbursementStatus)) {
        data[e.employee] = (data[e.employee] || 0) + (e.reimbursementAmount || 0);
      }
    });
    return Object.keys(data)
      .map(key => ({ name: key, value: data[key] }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [expenses]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(e => {
      data[e.category] = (data[e.category] || 0) + e.amount;
    });
    return Object.keys(data).map(key => ({ name: key, value: data[key] })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'white', padding: '12px', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(30, 30, 30, 0.05)' }}>
          <p className="font-semibold text-[var(--text-main)]">{`${label || payload[0].name}`}</p>
          <p className="font-bold text-[var(--primary)] mt-1">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Visual insights into spending and reimbursements</p>
        </div>
      </div>

      <div className="card mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-none flex flex-col items-center justify-center p-8">
        <span className="text-gray-500 font-medium mb-2 uppercase tracking-widest text-sm">Total Company Spending</span>
        <span className="text-4xl font-bold text-gray-900">{formatCurrency(totalSpending)}</span>
      </div>

      <div className="grid-charts">
        
        {/* Company vs Employee */}
        <div className="card">
          <h3 className="font-semibold mb-4 text-lg">Payer Distribution</h3>
          <div style={{ height: 260 }}>
            {payerData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={payerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {payerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Reimbursement Lifecycle */}
        <div className="card">
          <h3 className="font-semibold mb-4 text-lg">Reimbursement Lifecycle</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lifecycleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'var(--surface-hover)'}} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {lifecycleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.stage === 'Pending Approval' ? '#F59E0B' : entry.stage === 'Approved' ? '#3B82F6' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Owed Distribution */}
        <div className="card">
          <h3 className="font-semibold mb-4 text-lg">Currently Owed to Employees</h3>
          <div style={{ height: 300 }}>
            {employeeOwedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeOwedData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} tickFormatter={(val) => `₹${val}`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'var(--surface-hover)'}} />
                  <Bar dataKey="value" fill="#F43F5E" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
                <span className="font-medium">No outstanding liabilities</span>
                <span className="text-xs mt-1">All employees have been reimbursed.</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Spending */}
        <div className="card">
          <h3 className="font-semibold mb-4 text-lg">Category Spending</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 11}} angle={-45} textAnchor="end" height={60} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)'}} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'var(--surface-hover)'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
