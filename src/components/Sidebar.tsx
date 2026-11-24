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
      classes: { activeBg: 'bg-[var(--pastel-blue)] border-[var(--primary)]/20', hoverBg: 'hover:bg-[var(--surface-hover)]', activeText: 'text-[var(--primary)]', hoverIcon: 'group-hover:text-[var(--primary)]', activeLabel: 'text-[var(--text-main)]', hoverLabel: 'group-hover:text-[var(--text-main)]' }
    },
    { 
      to: '/add-expense', icon: <PlusCircle size={20} />, label: 'Add Expense', 
      classes: { activeBg: 'bg-[var(--pastel-green)] border-green-500/20', hoverBg: 'hover:bg-[var(--surface-hover)]', activeText: 'text-[var(--success-text)]', hoverIcon: 'group-hover:text-[var(--success-text)]', activeLabel: 'text-[var(--text-main)]', hoverLabel: 'group-hover:text-[var(--text-main)]' }
    },
    { 
      to: '/expenses', icon: <Receipt size={20} />, label: 'Expenses', 
      classes: { activeBg: 'bg-[var(--pastel-amber)] border-orange-500/20', hoverBg: 'hover:bg-[var(--surface-hover)]', activeText: 'text-orange-500', hoverIcon: 'group-hover:text-orange-500', activeLabel: 'text-[var(--text-main)]', hoverLabel: 'group-hover:text-[var(--text-main)]' }
    },
    { 
      to: '/analytics', icon: <PieChart size={20} />, label: 'Analytics', 
      classes: { activeBg: 'bg-[var(--pastel-purple)] border-purple-500/20', hoverBg: 'hover:bg-[var(--surface-hover)]', activeText: 'text-purple-500', hoverIcon: 'group-hover:text-purple-500', activeLabel: 'text-[var(--text-main)]', hoverLabel: 'group-hover:text-[var(--text-main)]' }
    },
    { 
      to: '/reports', icon: <Download size={20} />, label: 'Reports', 
      classes: { activeBg: 'bg-[var(--pastel-amber)] border-amber-500/20', hoverBg: 'hover:bg-[var(--surface-hover)]', activeText: 'text-[var(--warning-text)]', hoverIcon: 'group-hover:text-[var(--warning-text)]', activeLabel: 'text-[var(--text-main)]', hoverLabel: 'group-hover:text-[var(--text-main)]' }
    },
    { 
      to: '/categories', icon: <Tags size={20} />, label: 'Categories', 
      classes: { activeBg: 'bg-[var(--pastel-teal)] border-teal-500/20', hoverBg: 'hover:bg-[var(--surface-hover)]', activeText: 'text-teal-500', hoverIcon: 'group-hover:text-teal-500', activeLabel: 'text-[var(--text-main)]', hoverLabel: 'group-hover:text-[var(--text-main)]' }
    },
    { 
      to: '/settings', icon: <Settings size={20} />, label: 'Settings', 
      classes: { activeBg: 'bg-[var(--pastel-gray)] border-[var(--border-color)]', hoverBg: 'hover:bg-[var(--surface-hover)]', activeText: 'text-[var(--text-main)]', hoverIcon: 'group-hover:text-[var(--text-main)]', activeLabel: 'text-[var(--text-main)]', hoverLabel: 'group-hover:text-[var(--text-main)]' }
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
