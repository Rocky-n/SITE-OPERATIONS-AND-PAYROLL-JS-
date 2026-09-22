import React, { useState, useEffect } from 'react';
import { X, Building2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectApi } from '../services/api';

export default function ProjectModal({ projectToEdit, isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Active');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name || '');
      setLocation(projectToEdit.location || '');
      setStartDate(
        projectToEdit.startDate
          ? new Date(projectToEdit.startDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setStatus(projectToEdit.status || 'Active');
      setDescription(projectToEdit.description || '');
    } else {
      setName('');
      setLocation('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setStatus('Active');
      setDescription('');
    }
  }, [projectToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !location || !startDate) {
      setErrorMsg('Project name, location, and start date are required');
      toast.error('Project name, location, and start date are required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        name,
        location,
        startDate,
        status,
        description,
      };

      if (projectToEdit) {
        await projectApi.update(projectToEdit._id, payload);
        toast.success(`Project "${name}" updated`);
      } else {
        await projectApi.create(payload);
        toast.success(`Project "${name}" created`);
      }

      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Failed to save project';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {projectToEdit ? 'Edit Construction Site' : 'New Construction Site'}
              </h3>
              <p className="text-xs text-slate-400">Project Management &amp; Site Tracking</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Metro Line 4 - Phase 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Site Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sector 62, Noida, UP"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-orange-500"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows="3"
              placeholder="Brief overview of the project scope, contract terms, or milestones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-600/30 flex items-center gap-2"
            >
              {loading ? 'Saving...' : projectToEdit ? 'Update Site' : 'Create Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
