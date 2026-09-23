import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  MapPin,
  Calendar,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ProjectModal from '../components/ProjectModal';
import { projectApi } from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // 'All' | 'Active' | 'Completed'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectApi.getAll();
      setProjects(res.data.data || []);
      setLoading(false);
    } catch (err) {
      setErrorMsg('Failed to load projects');
      toast.error('Failed to load projects');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEdit = (project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete project "${name}"?`)) return;
    try {
      await projectApi.delete(id);
      toast.success(`Project "${name}" deleted`);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === 'All') return true;
    return p.status === filter;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Construction Sites &amp; Projects</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage running applications, active jobsites, and project timelines.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-5 py-2.5 min-h-[44px] bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-600/30 flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Construction Site</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap">
        {['All', 'Active', 'Completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2.5 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === tab
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab} Sites ({tab === 'All' ? projects.length : projects.filter((p) => p.status === tab).length})
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base">No construction sites found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Get started by registering an active site to assign workers and log daily attendance.
          </p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Create First Site
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <div
              key={p._id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      p.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {p.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Site"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete Site"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{p.name}</h3>

                <div className="space-y-2 mt-4 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{p.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Started: {new Date(p.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {p.workerCount || 0} Workers Assigned
                    </span>
                  </div>
                </div>

                {p.description && (
                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 line-clamp-2">
                    {p.description}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Created {new Date(p.createdAt).toLocaleDateString()}</span>
                <span className="font-medium text-orange-600 dark:text-orange-400">Site ID: {p._id.slice(-6)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        projectToEdit={projectToEdit}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
