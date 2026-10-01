import React, { useState, useEffect } from 'react';
import { useSettings } from '../store/ExpenseContext';
import { CheckCircle, Building, Sliders, Bell, Layout } from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  
  const [formData, setFormData] = useState({
    companyName: settings.companyName,
    defaultCurrency: settings.defaultCurrency,
    financialYearStartMonth: settings.financialYearStartMonth,
    appearance: settings.appearance || 'light',
    notificationsEnabled: settings.notificationsEnabled ?? true
  });
  
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData({
      companyName: settings.companyName,
      defaultCurrency: settings.defaultCurrency,
      financialYearStartMonth: settings.financialYearStartMonth,
      appearance: settings.appearance || 'light',
      notificationsEnabled: settings.notificationsEnabled ?? true
    });
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'financialYearStartMonth' ? Number(value) : value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.companyName.trim()) {
      alert("Company Name is required");
      return;
    }
    
    updateSettings({
      companyName: formData.companyName,
      defaultCurrency: formData.defaultCurrency,
      financialYearStartMonth: formData.financialYearStartMonth,
      appearance: formData.appearance,
      notificationsEnabled: formData.notificationsEnabled
    });
    
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Application preferences and configuration</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <form onSubmit={handleSave}>
          
          <div className="form-section">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[var(--pastel-blue)] text-blue-700 flex items-center justify-center">
                <Building size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold m-0 text-[var(--text-main)]">Company Information</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage your organization's basic details.</p>
              </div>
            </div>
            <div className="h-px bg-[var(--border-light)] w-full my-6"></div>
            
            <div className="form-group max-w-md mb-6">
              <label className="form-label">Company Name</label>
              <input 
                type="text" 
                name="companyName"
                className="form-control" 
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[var(--pastel-teal)] text-teal-700 flex items-center justify-center">
                <Sliders size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold m-0 text-[var(--text-main)]">General Settings</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Configure currency and financial periods.</p>
              </div>
            </div>
            <div className="h-px bg-[var(--border-light)] w-full my-6"></div>
            
            <div className="form-row">
              <div className="form-group mb-0">
                <label className="form-label">Default Currency</label>
                <select 
                  name="defaultCurrency"
                  className="form-control" 
                  value={formData.defaultCurrency}
                  onChange={handleChange}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <p className="text-xs text-[var(--text-muted)] mt-1.5">This changes the display currency symbol.</p>
              </div>
              
              <div className="form-group mb-0">
                <label className="form-label">Financial Year Start Month</label>
                <select 
                  name="financialYearStartMonth"
                  className="form-control" 
                  value={formData.financialYearStartMonth}
                  onChange={handleChange}
                >
                  <option value="1">January</option>
                  <option value="4">April</option>
                  <option value="7">July</option>
                  <option value="10">October</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[var(--pastel-purple)] text-purple-700 flex items-center justify-center">
                <Layout size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold m-0 text-[var(--text-main)]">Appearance</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Customize how the application looks.</p>
              </div>
            </div>
            <div className="h-px bg-[var(--border-light)] w-full my-6"></div>
            
            <div className="form-group max-w-md mb-0">
              <label className="form-label">Theme</label>
              <select 
                name="appearance"
                className="form-control" 
                value={formData.appearance}
                onChange={handleChange}
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[var(--pastel-amber)] text-amber-700 flex items-center justify-center">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold m-0 text-[var(--text-main)]">Notifications</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage alerts and email preferences.</p>
              </div>
            </div>
            <div className="h-px bg-[var(--border-light)] w-full my-6"></div>
            
            <div className="form-group mb-0">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="notificationsEnabled"
                  checked={formData.notificationsEnabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                  className="w-5 h-5 text-[var(--primary)] rounded focus:ring-[var(--primary)] border-gray-300"
                />
                <span className="text-[var(--text-main)] font-medium">Enable In-App Notifications</span>
              </label>
              <p className="text-sm text-[var(--text-secondary)] ml-8 mt-1">
                Receive notifications when expenses are added, updated, or deleted.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-6">
            <button type="submit" className="btn btn-primary px-8">Save Changes</button>
            {success && (
              <span className="flex items-center gap-2 text-sm text-[var(--success-text)] bg-[var(--success-bg)] px-4 py-2 rounded-md shadow-sm">
                <CheckCircle size={18} /> Saved successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
