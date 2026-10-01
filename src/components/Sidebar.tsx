import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  PieChart, 
  Download, 
  Tags, 
  Settings 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { 
      to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard', 
      classes: { activeBg: 'bg-blue-50 border-blue-100', hoverBg: 'hover:bg-blue-50/50', activeText: 'text-blue-600', hoverIcon: 'group-hover:text-blue-500', activeLabel: 'text-blue-900', hoverLabel: 'group-hover:text-blue-800' }
    },
    { 
      to: '/add-expense', icon: <PlusCircle size={20} />, label: 'Add Expense', 
      classes: { activeBg: 'bg-emerald-50 border-emerald-100', hoverBg: 'hover:bg-emerald-50/50', activeText: 'text-emerald-600', hoverIcon: 'group-hover:text-emerald-500', activeLabel: 'text-emerald-900', hoverLabel: 'group-hover:text-emerald-800' }
    },
    { 
      to: '/expenses', icon: <Receipt size={20} />, label: 'Expenses', 
      classes: { activeBg: 'bg-orange-50 border-orange-100', hoverBg: 'hover:bg-orange-50/50', activeText: 'text-orange-600', hoverIcon: 'group-hover:text-orange-500', activeLabel: 'text-orange-900', hoverLabel: 'group-hover:text-orange-800' }
    },
    { 
      to: '/analytics', icon: <PieChart size={20} />, label: 'Analytics', 
      classes: { activeBg: 'bg-purple-50 border-purple-100', hoverBg: 'hover:bg-purple-50/50', activeText: 'text-purple-600', hoverIcon: 'group-hover:text-purple-500', activeLabel: 'text-purple-900', hoverLabel: 'group-hover:text-purple-800' }
    },
    { 
      to: '/reports', icon: <Download size={20} />, label: 'Reports', 
      classes: { activeBg: 'bg-amber-50 border-amber-100', hoverBg: 'hover:bg-amber-50/50', activeText: 'text-amber-600', hoverIcon: 'group-hover:text-amber-500', activeLabel: 'text-amber-900', hoverLabel: 'group-hover:text-amber-800' }
    },
    { 
      to: '/categories', icon: <Tags size={20} />, label: 'Categories', 
      classes: { activeBg: 'bg-teal-50 border-teal-100', hoverBg: 'hover:bg-teal-50/50', activeText: 'text-teal-600', hoverIcon: 'group-hover:text-teal-500', activeLabel: 'text-teal-900', hoverLabel: 'group-hover:text-teal-800' }
    },
    { 
      to: '/settings', icon: <Settings size={20} />, label: 'Settings', 
      classes: { activeBg: 'bg-slate-100 border-slate-200', hoverBg: 'hover:bg-slate-50', activeText: 'text-slate-600', hoverIcon: 'group-hover:text-slate-500', activeLabel: 'text-slate-900', hoverLabel: 'group-hover:text-slate-800' }
    },
  ];

  return (
    <aside className="w-[280px] bg-[var(--surface-accent)] border-r border-[var(--border-color)] h-full flex flex-col p-4 shrink-0 overflow-y-auto">
      <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4 px-3 mt-2">
        Menu
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to} 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? `${item.classes.activeBg} shadow-sm border` 
                  : `${item.classes.hoverBg} border border-transparent`
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`transition-colors duration-300 ${
                  isActive 
                    ? item.classes.activeText 
                    : `text-[var(--text-muted)] ${item.classes.hoverIcon}`
                }`}>
                  {item.icon}
                </span>
                <span className={`transition-colors duration-300 ${
                  isActive 
                    ? `${item.classes.activeLabel} font-semibold` 
                    : `text-[var(--text-secondary)] ${item.classes.hoverLabel} font-medium`
                }`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
