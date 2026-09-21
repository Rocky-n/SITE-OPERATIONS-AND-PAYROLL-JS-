import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Building2,
  Edit2,
  Trash2,
  HandCoins,
  ShieldCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';
import WorkerModal from '../components/WorkerModal';
import AdvanceModal from '../components/AdvanceModal';
import { workerApi, projectApi } from '../services/api';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [workerToEdit, setWorkerToEdit] = useState(null);

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceWorkerId, setAdvanceWorkerId] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workRes, projRes] = await Promise.all([
        workerApi.getAll(),
        projectApi.getAll(),
      ]);
      setWorkers(workRes.data.data || []);
      setProjects(projRes.data.data || []);
      setLoading(false);
    } catch (err) {
      setErrorMsg('Failed to load workers data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = () => {
    setWorkerToEdit(null);
    setIsWorkerModalOpen(true);
  };

  const handleEdit = (worker) => {
    setWorkerToEdit(worker);
    setIsWorkerModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete worker "${name}"?`)) return;
    try {
      await workerApi.delete(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete worker');
    }
  };

  const handleIssueAdvance = (workerId) => {
    setAdvanceWorkerId(workerId);
    setIsAdvanceModalOpen(true);
  };

  // Filter workers
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.phone.includes(search) ||
      (w.role && w.role.toLowerCase().includes(search.toLowerCase()));

    const matchesProject = !selectedProject || (w.assignedProject?._id === selectedProject);
    const matchesStatus = selectedStatus === 'All' || w.status === selectedStatus;

    return matchesSearch && matchesProject && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Worker Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain daily wage rates, site assignments, and contact records for all laborers.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Worker</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by worker name, phone, trade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Construction Sites</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-orange-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Workers Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm font-medium">
          Loading worker registry...
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">No workers match criteria</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search filters or register a new worker.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Worker Name &amp; Trade</th>
                  <th className="py-3.5 px-6">Phone Number</th>
                  <th className="py-3.5 px-6">Assigned Construction Site</th>
                  <th className="py-3.5 px-6 text-right">Daily Wage Rate</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {filteredWorkers.map((w) => (
                  <tr key={w._id} className="hover:bg-orange-50/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{w.name}</div>
                      <div className="text-[11px] text-slate-500">{w.role || 'General Worker'}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {w.phone}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-orange-600" />
                        <span>{w.assignedProject?.name || 'Unassigned'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{w.assignedProject?.location || ''}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-bold text-slate-900 text-sm">₹{w.dailyWageRate?.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 block">/ day</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          w.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleIssueAdvance(w._id)}
                          title="Issue Advance"
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <HandCoins className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(w)}
                          title="Edit Worker"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(w._id, w.name)}
                          title="Delete Worker"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <WorkerModal
        projects={projects}
        workerToEdit={workerToEdit}
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        onSuccess={fetchData}
      />

      <AdvanceModal
        workers={workers}
        preselectedWorkerId={advanceWorkerId}
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
