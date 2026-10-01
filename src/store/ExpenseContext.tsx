import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Expense, Category, Settings, NotificationItem } from '../types';
import { MOCK_EXPENSES, INITIAL_CATEGORIES, DEFAULT_SETTINGS } from '../data/mockData';

interface AppContextType {
  expenses: Expense[];
  categories: Category[];
  settings: Settings;
  notifications: NotificationItem[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (settings: Settings) => void;
  addNotification: (text: string) => void;
  markNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('company_expenses');
    let loaded: Expense[] = saved ? JSON.parse(saved) : MOCK_EXPENSES;
    
    let maxAx = 0;
    loaded.forEach(exp => {
      if(exp.id.startsWith('AX')) {
        const num = parseInt(exp.id.substring(2));
        if(!isNaN(num) && num > maxAx) maxAx = num;
      }
    });

    return loaded.map(exp => {
      if(!exp.id.startsWith('AX')) {
        maxAx++;
        return { ...exp, id: `AX${String(maxAx).padStart(3, '0')}` };
      }
      return exp;
    });
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('company_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('company_settings');
    const defaultSettingsWithExtensions = { ...DEFAULT_SETTINGS, appearance: 'light', notificationsEnabled: true };
    return saved ? { ...defaultSettingsWithExtensions, ...JSON.parse(saved) } : defaultSettingsWithExtensions;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('company_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('company_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('company_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('company_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('company_notifications', JSON.stringify(notifications)); }, [notifications]);

  const addNotification = (text: string) => {
    if (settings.notificationsEnabled === false) return;
    setNotifications(prev => {
      const newNotif = { id: `n${Date.now()}`, text, time: new Date().toISOString(), read: false };
      return [newNotif, ...prev].slice(0, 20); // Keep last 20
    });
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    setExpenses((prev) => {
      let maxAx = 0;
      prev.forEach(exp => {
        if(exp.id.startsWith('AX')) {
          const num = parseInt(exp.id.substring(2));
          if(!isNaN(num) && num > maxAx) maxAx = num;
        }
      });
      const newId = `AX${String(maxAx + 1).padStart(3, '0')}`;
      addNotification(`New expense ${newId} added by ${expenseData.employee}`);
      return [{ ...expenseData, id: newId }, ...prev];
    });
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp))
    );
    addNotification(`Expense ${updatedExpense.id} updated`);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    addNotification(`Expense ${id} deleted`);
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    setCategories(prev => {
      const newId = `c${Date.now()}`;
      return [...prev, { ...categoryData, id: newId }];
    });
    addNotification(`Category ${categoryData.name} added`);
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    addNotification(`Category ${updatedCategory.name} updated`);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    addNotification(`Category deleted`);
  };

  return (
    <AppContext.Provider value={{ 
      expenses, categories, settings, notifications,
      addExpense, updateExpense, deleteExpense,
      addCategory, updateCategory, deleteCategory,
      updateSettings: setSettings,
      addNotification, markNotificationsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useExpenses must be used within an ExpenseProvider');
  return context;
};

export const useCategories = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useCategories must be used within an ExpenseProvider');
  return context;
};

export const useSettings = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useSettings must be used within an ExpenseProvider');
  return context;
};
