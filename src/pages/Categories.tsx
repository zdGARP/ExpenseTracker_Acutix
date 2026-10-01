import React, { useState } from 'react';
import { useCategories, useExpenses } from '../store/ExpenseContext';
import { Tags, Trash2, Edit2, X, Check } from 'lucide-react';
import type { Category } from '../types';

const Categories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { expenses } = useExpenses();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', color: '#3B82F6' });

  const PRESET_COLORS = ['#93C5FD', '#6EE7B7', '#FCA5A5', '#FCD34D', '#C4B5FD', '#86EFAC', '#A78BFA', '#F9A8D4', '#D1D5DB'];

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, color: cat.color });
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ name: '', color: PRESET_COLORS[0] });
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if(!formData.name.trim()) return;

    if(isAdding) {
      addCategory({ name: formData.name, color: formData.color });
    } else if(editingId) {
      updateCategory({ id: editingId, name: formData.name, color: formData.color });
    }
    
    cancelEdit();
  };

  const handleDelete = (id: string, name: string) => {
    const isUsed = expenses.some(e => e.category === name);
    if(isUsed) {
      alert(`Cannot delete category "${name}" because it is currently used by some expenses. Please reassign those expenses first.`);
      return;
    }
    
    if(window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      deleteCategory(id);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage expense categories and colors</p>
        </div>
        {!isAdding && <button className="btn btn-primary" onClick={handleAdd}>+ Add Category</button>}
      </div>

      {(isAdding || editingId) && (
        <div className="card mb-6 bg-[var(--surface-color)] border border-[var(--border-color)]">
          <h3 className="font-semibold mb-4 text-lg">{isAdding ? 'New Category' : 'Edit Category'}</h3>
          <div className="flex gap-4 items-start flex-wrap">
            <div className="form-group flex-1 min-w-[200px] mb-0">
              <label className="form-label">Category Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Travel"
              />
            </div>
            <div className="form-group min-w-[200px] mb-0">
              <label className="form-label">Color Theme</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PRESET_COLORS.map(c => (
                  <div 
                    key={c}
                    onClick={() => setFormData({...formData, color: c})}
                    className="w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                    style={{ backgroundColor: c, border: formData.color === c ? '2px solid var(--text-main)' : '2px solid transparent' }}
                  >
                    {formData.color === c && <Check size={16} className="text-[var(--text-main)]" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save Category</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {categories.map(cat => {
          const catExpenses = expenses.filter(e => e.category === cat.name);
          const totalSpent = catExpenses.reduce((sum, e) => sum + e.amount, 0);

          return (
            <div key={cat.id} className="card flex flex-col justify-between" style={{ backgroundColor: cat.color }}>
              <div className="flex justify-between items-start mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center bg-white/50 backdrop-blur-sm text-[var(--text-main)] shadow-sm"
                >
                  <Tags size={20} />
                </div>
                <div className="flex gap-1 bg-white/50 rounded-lg backdrop-blur-sm p-1">
                  <button 
                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors rounded-md hover:bg-white"
                    onClick={() => handleEdit(cat)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors rounded-md hover:bg-white"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-[var(--text-main)] text-xl mb-1 truncate">{cat.name}</h3>
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-lg text-[var(--text-main)]">
                    ₹{totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-xs font-medium text-[var(--text-secondary)] bg-white/50 px-2 py-1 rounded-full">
                    {catExpenses.length} expenses
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;
