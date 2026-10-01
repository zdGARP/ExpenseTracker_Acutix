import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ExpenseProvider } from './store/ExpenseContext';
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Categories from './pages/Categories';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <ExpenseProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="add-expense" element={<AddExpense />} />
            <Route path="edit-expense/:id" element={<AddExpense />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="categories" element={<Categories />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </ExpenseProvider>
  );
};

export default App;
