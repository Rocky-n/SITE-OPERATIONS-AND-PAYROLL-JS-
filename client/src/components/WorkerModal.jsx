import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { workerApi } from '../services/api';

export default function WorkerModal({ projects, workerToEdit, isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dailyWageRate, setDailyWageRate] = useState('');
  const [assignedProject, setAssignedProject] = useState('');
  const [role, setRole] = useState('General Worker');
  const [status, setStatus] = useState('Active');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (workerToEdit) {
      setName(workerToEdit.name || '');
      setPhone(workerToEdit.phone || '');
      setDailyWageRate(workerToEdit.dailyWageRate || '');
      setAssignedProject(workerToEdit.assignedProject?._id || workerToEdit.assignedProject || '');
      setRole(workerToEdit.role || 'General Worker');
      setStatus(workerToEdit.status || 'Active');
    } else {
      setName('');
      setPhone('');
      setDailyWageRate('800');
      setAssignedProject(projects[0]?._id || '');
      setRole('General Worker');
      setStatus('Active');
    }
  }, [workerToEdit, projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !dailyWageRate || !assignedProject) {
      setErrorMsg('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        name,
        phone,
        dailyWageRate: Number(dailyWageRate),
        assignedProject,
        role,
        status,
      };

      if (workerToEdit) {
        await workerApi.update(workerToEdit._id, payload);
        toast.success(`Worker "${name}" updated`);
      } else {
        await workerApi.create(payload);
        toast.success(`Worker "${name}" registered`);
      }

      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Failed to save worker details';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  const tradeRoles = [
    'General Worker',
    'Mason Specialist',
    'Steel Fixer',
    'Carpenter',
    'Concrete Finisher',
    'Electrician',
    'Plumber',
    'Heavy Equipment Operator',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md md:max-w-lg mx-auto max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors my-auto">
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {workerToEdit ? 'Edit Worker Profile' : 'Register New Worker'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Worker Registry &amp; Wage Setup</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="+91 9876543201"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Wage Rate (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">₹</span>
                <input
                  type="number"
                  min="1"
                  placeholder="850"
                  value={dailyWageRate}
                  onChange={(e) => setDailyWageRate(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trade / Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-orange-500"
              >
                {tradeRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Construction Site <span className="text-red-500">*</span>
            </label>
            <select
              value={assignedProject}
              onChange={(e) => setAssignedProject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">-- Select Project Site --</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="workerStatus"
                  value="Active"
                  checked={status === 'Active'}
                  onChange={() => setStatus('Active')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span>Active</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="workerStatus"
                  value="Inactive"
                  checked={status === 'Inactive'}
                  onChange={() => setStatus('Inactive')}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span>Inactive</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Saving...' : workerToEdit ? 'Update Worker' : 'Register Worker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
