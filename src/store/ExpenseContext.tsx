import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { Expense, Category, Settings, NotificationItem } from '../types';
import { MOCK_EXPENSES, INITIAL_CATEGORIES, DEFAULT_SETTINGS } from '../data/mockData';
import { 
  supabase, 
  toDbExpense, 
  fromDbExpense, 
  toDbCategory, 
  fromDbCategory, 
  toDbSettings, 
  fromDbSettings 
} from '../lib/supabase';

interface AppContextType {
  expenses: Expense[];
  categories: Category[];
  settings: Settings;
  notifications: NotificationItem[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void> | void;
  updateExpense: (expense: Expense) => Promise<void> | void;
  deleteExpense: (id: string) => Promise<void> | void;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void> | void;
  updateCategory: (category: Category) => Promise<void> | void;
  deleteCategory: (id: string) => Promise<void> | void;
  updateSettings: (settings: Settings) => Promise<void> | void;
  addNotification: (text: string) => void;
  markNotificationsRead: () => void;
  isSyncing: boolean;
  manualSync: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage cache for instant render without flash of empty state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('company_expenses');
    let loaded: Expense[] = saved ? JSON.parse(saved) : MOCK_EXPENSES;
    
    let maxAx = 0;
    loaded.forEach(exp => {
      if (exp.id.startsWith('AX')) {
        const num = parseInt(exp.id.substring(2));
        if (!isNaN(num) && num > maxAx) maxAx = num;
      }
    });

    return loaded.map(exp => {
      if (!exp.id.startsWith('AX')) {
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

  const [isSyncing, setIsSyncing] = useState(false);

  // Keep localStorage updated as persistent local cache
  useEffect(() => { localStorage.setItem('company_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('company_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('company_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('company_notifications', JSON.stringify(notifications)); }, [notifications]);

  // Handle dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (
      settings.appearance === 'dark' ||
      (settings.appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.appearance]);

  // Master Synchronization Function: pulls from Supabase and auto-seeds any local data
  const syncWithSupabase = async () => {
    setIsSyncing(true);
    try {
      // 1. Fetch expenses from shared Supabase database
      const { data: dbExpenses, error: expError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (expError) {
        console.warn('Supabase expenses query returned notice:', expError.message);
      } else {
        const remoteExpenses: Expense[] = (dbExpenses || []).map(fromDbExpense);

        // Check if current browser has local records not yet present in Supabase (auto-migration)
        const saved = localStorage.getItem('company_expenses');
        const localExpenses: Expense[] = saved ? JSON.parse(saved) : [];
        const remoteIdSet = new Set(remoteExpenses.map(e => e.id));
        const unsyncedLocal = localExpenses.filter(e => !remoteIdSet.has(e.id));

        if (unsyncedLocal.length > 0) {
          console.info(`Auto-migrating ${unsyncedLocal.length} local records to shared Supabase database...`);
          const rowsToInsert = unsyncedLocal.map(toDbExpense);
          const { error: upsertErr } = await supabase
            .from('expenses')
            .upsert(rowsToInsert, { onConflict: 'id' });

          if (!upsertErr) {
            console.info('Auto-migration completed successfully.');
            remoteExpenses.push(...unsyncedLocal);
          } else {
            console.warn('Could not auto-migrate local records:', upsertErr.message);
          }
        }

        // Sort descending by date
        remoteExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(remoteExpenses);
        localStorage.setItem('company_expenses', JSON.stringify(remoteExpenses));
      }

      // 2. Fetch shared Categories
      const { data: dbCategories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (!catError && dbCategories && dbCategories.length > 0) {
        const loadedCats = dbCategories.map(fromDbCategory);
        setCategories(loadedCats);
        localStorage.setItem('company_categories', JSON.stringify(loadedCats));
      } else if (!catError && dbCategories && dbCategories.length === 0) {
        // Seed default categories to Supabase if empty
        const initialToSeed = INITIAL_CATEGORIES.map(toDbCategory);
        await supabase.from('categories').upsert(initialToSeed, { onConflict: 'id' });
      }

      // 3. Fetch shared Settings
      const { data: dbSettings, error: setErr } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!setErr && dbSettings) {
        const loadedSettings = fromDbSettings(dbSettings);
        setSettings(loadedSettings);
        localStorage.setItem('company_settings', JSON.stringify(loadedSettings));
      }
    } catch (err) {
      console.warn('Sync connection check:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Perform initial sync on mount and establish Realtime subscription
  useEffect(() => {
    let isMounted = true;
    syncWithSupabase();

    // Listen for Realtime changes from other users
    const channel = supabase
      .channel('shared_expenses_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        (payload) => {
          if (!isMounted) return;
          if (payload.eventType === 'INSERT') {
            const newExp = fromDbExpense(payload.new);
            setExpenses(prev => {
              if (prev.some(e => e.id === newExp.id)) return prev;
              return [newExp, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = fromDbExpense(payload.new);
            setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
          } else if (payload.eventType === 'DELETE') {
            const deletedId = String((payload.old as any)?.id);
            if (deletedId) {
              setExpenses(prev => prev.filter(e => e.id !== deletedId));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          if (!isMounted) return;
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const cat = fromDbCategory(payload.new);
            setCategories(prev => {
              const filtered = prev.filter(c => c.id !== cat.id);
              return [...filtered, cat];
            });
          } else if (payload.eventType === 'DELETE') {
            const catId = String((payload.old as any)?.id);
            if (catId) setCategories(prev => prev.filter(c => c.id !== catId));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'settings' },
        (payload) => {
          if (!isMounted) return;
          if (payload.new) {
            setSettings(fromDbSettings(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const addNotification = (text: string) => {
    if (settings.notificationsEnabled === false) return;
    setNotifications(prev => {
      const newNotif = { id: `n${Date.now()}`, text, time: new Date().toISOString(), read: false };
      return [newNotif, ...prev].slice(0, 20);
    });
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    let maxAx = 0;
    expenses.forEach(exp => {
      if (exp.id.startsWith('AX')) {
        const num = parseInt(exp.id.substring(2));
        if (!isNaN(num) && num > maxAx) maxAx = num;
      }
    });
    const newId = `AX${String(maxAx + 1).padStart(3, '0')}`;
    const newExpense: Expense = { ...expenseData, id: newId };

    // Optimistic local update
    setExpenses(prev => [newExpense, ...prev.filter(e => e.id !== newId)]);
    addNotification(`New expense ${newId} added by ${expenseData.employee}`);

    // Persist directly to Supabase
    try {
      const dbRow = toDbExpense(newExpense);
      const { error } = await supabase.from('expenses').insert(dbRow);
      if (error) {
        console.warn('Supabase insert notice:', error.message);
      }
    } catch (err) {
      console.warn('Error saving expense to Supabase:', err);
    }
  };

  const updateExpense = async (updatedExpense: Expense) => {
    // Optimistic local update
    setExpenses(prev =>
      prev.map(exp => (exp.id === updatedExpense.id ? updatedExpense : exp))
    );
    addNotification(`Expense ${updatedExpense.id} updated`);

    // Persist directly to Supabase
    try {
      const dbRow = toDbExpense(updatedExpense);
      const { error } = await supabase
        .from('expenses')
        .update(dbRow)
        .eq('id', updatedExpense.id);
      if (error) {
        console.warn('Supabase update notice:', error.message);
      }
    } catch (err) {
      console.warn('Error updating expense in Supabase:', err);
    }
  };

  const deleteExpense = async (id: string) => {
    // Optimistic local update
    setExpenses(prev => prev.filter(exp => exp.id !== id));
    addNotification(`Expense ${id} deleted`);

    // Persist directly to Supabase
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      if (error) {
        console.warn('Supabase delete notice:', error.message);
      }
    } catch (err) {
      console.warn('Error deleting expense from Supabase:', err);
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    const newId = `c${Date.now()}`;
    const newCategory: Category = { ...categoryData, id: newId };
    setCategories(prev => [...prev, newCategory]);
    addNotification(`Category ${categoryData.name} added`);

    try {
      await supabase.from('categories').insert(toDbCategory(newCategory));
    } catch (err) {
      console.warn('Error saving category to Supabase:', err);
    }
  };

  const updateCategory = async (updatedCategory: Category) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    addNotification(`Category ${updatedCategory.name} updated`);

    try {
      await supabase
        .from('categories')
        .update(toDbCategory(updatedCategory))
        .eq('id', updatedCategory.id);
    } catch (err) {
      console.warn('Error updating category in Supabase:', err);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    addNotification(`Category deleted`);

    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (err) {
      console.warn('Error deleting category from Supabase:', err);
    }
  };

  const updateSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    try {
      await supabase
        .from('settings')
        .upsert(toDbSettings(newSettings), { onConflict: 'id' });
    } catch (err) {
      console.warn('Error updating settings in Supabase:', err);
    }
  };

  return (
    <AppContext.Provider value={{ 
      expenses, categories, settings, notifications,
      addExpense, updateExpense, deleteExpense,
      addCategory, updateCategory, deleteCategory,
      updateSettings,
      addNotification, markNotificationsRead,
      isSyncing, manualSync: syncWithSupabase
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
