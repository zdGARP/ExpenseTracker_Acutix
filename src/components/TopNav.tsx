import React, { useState } from 'react';
import { Search, Bell, User, Check } from 'lucide-react';
import { useSettings, useExpenses } from '../store/ExpenseContext';
import { format } from 'date-fns';

const TopNav: React.FC = () => {
  const { settings } = useSettings();
  const { notifications, markNotificationsRead } = useExpenses() as any; // Cast since useSettings doesn't expose it
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <header className="h-16 bg-[var(--surface-color)] border-b border-[var(--border-color)] flex items-center justify-between px-6 shrink-0 z-20 relative">
      <div className="flex items-center gap-3 w-64">
        <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">A</div>
        <span className="font-bold text-xl text-[var(--text-main)] tracking-tight">{settings.companyName}</span>
      </div>

      <div className="flex-1 max-w-xl mx-8 relative hidden md:block">
        <Search className="absolute left-3 top-2.5 text-[var(--text-muted)]" size={18} />
        <input 
          type="text" 
          placeholder="Search expenses, categories, or vendors..." 
          className="w-full bg-[var(--surface-hover)] border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all placeholder-gray-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = e.currentTarget.value;
              if (val) {
                window.location.href = `/expenses?search=${encodeURIComponent(val)}`;
              }
            }
          }}
        />
      </div>

      <div className="flex items-center gap-4 relative">
        <button 
          className="p-2 text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] rounded-full transition-colors relative"
          onClick={() => { setShowNotifications(!showNotifications); if(unreadCount > 0) markNotificationsRead(); }}
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--danger)] rounded-full border-2 border-white"></span>}
        </button>
        
        {showNotifications && (
          <div className="absolute top-12 right-12 w-80 bg-white shadow-[var(--shadow-lg)] rounded-[var(--radius-lg)] border border-[var(--border-color)] overflow-hidden z-50">
            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--surface-accent)]">
              <h4 className="font-bold">Notifications</h4>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">No recent activity</div>
              ) : (
                notifications.map((n: any) => (
                  <div key={n.id} className={`p-4 border-b border-gray-100 last:border-0 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                    <p className="text-sm font-medium text-gray-800">{n.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{format(new Date(n.time), 'MMM d, h:mm a')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="h-8 w-[1px] bg-[var(--border-color)] mx-1"></div>
        <button className="flex items-center gap-2 hover:bg-[var(--surface-hover)] p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-[var(--border-color)]">
          <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center font-semibold text-sm">
            US
          </div>
          <span className="text-sm font-medium hidden sm:block text-[var(--text-main)]">Admin User</span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
