import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  AlertCircle,
  Users,
  Check,
} from 'lucide-react';
import { attendanceApi, projectApi } from '../services/api';

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch projects list
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectApi.getAll();
        setProjects(res.data.data || []);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    loadProjects();
  }, []);

  // Fetch attendance for selected date and project
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const params = { date };
      if (selectedProject) params.projectId = selectedProject;

      const res = await attendanceApi.getByDate(params);
      setAttendanceList(res.data.data || []);
      setLoading(false);
    } catch (err) {
      setErrorMsg('Failed to load attendance for the selected date');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date, selectedProject]);

  // Handle individual status toggle
  const handleStatusChange = async (workerId, newStatus) => {
    // Optimistic UI update
    setAttendanceList((prev) =>
      prev.map((item) =>
        item.worker._id === workerId ? { ...item, status: newStatus } : item
      )
    );

    try {
      const target = attendanceList.find((i) => i.worker._id === workerId);
      await attendanceApi.mark({
        workerId,
        projectId: target?.worker?.assignedProject?._id || target?.worker?.assignedProject,
        date,
        status: newStatus,
        notes: target?.notes || '',
      });
      showNotification(`Attendance updated for ${target?.worker?.name}`);
    } catch (err) {
      setErrorMsg('Failed to record attendance change');
    }
  };

  // Quick helper: Set all to Present / Absent
  const handleSetAll = async (status) => {
    const updated = attendanceList.map((item) => ({
      ...item,
      status,
    }));
    setAttendanceList(updated);

    try {
      setSaving(true);
      const records = updated.map((item) => ({
        workerId: item.worker._id,
        projectId: item.worker?.assignedProject?._id || item.worker?.assignedProject,
        status,
        notes: item.notes || '',
      }));

      await attendanceApi.bulkMark({ date, records });
      setSaving(false);
      showNotification(`All workers marked as ${status}`);
    } catch (err) {
      setSaving(false);
      setErrorMsg('Failed to bulk update attendance');
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Summary counts
  const presentCount = attendanceList.filter((a) => a.status === 'Present').length;
  const halfDayCount = attendanceList.filter((a) => a.status === 'Half-day').length;
  const absentCount = attendanceList.filter((a) => a.status === 'Absent').length;
  const unmarkedCount = attendanceList.filter((a) => a.status === 'Unmarked').length;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Daily Attendance Tracker</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log daily attendance records for wage and payroll calculations.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <Calendar className="w-4 h-4 text-orange-600 ml-2" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none pr-2 cursor-pointer"
          />
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Roster Controls & Stats */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Status Counts */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>{presentCount} Present</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>{halfDayCount} Half-day</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 rounded-xl border border-rose-100 text-rose-800 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>{absentCount} Absent</span>
          </div>
          {unmarkedCount > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              <span>{unmarkedCount} Unmarked</span>
            </div>
          )}
        </div>

        {/* Quick Batch Actions & Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Sites</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={() => handleSetAll('Present')}
            disabled={saving || attendanceList.length === 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            Mark All Present
          </button>

          <button
            onClick={() => handleSetAll('Absent')}
            disabled={saving || attendanceList.length === 0}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Attendance Roster Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm font-medium">
          Loading attendance roster...
        </div>
      ) : attendanceList.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">No active workers found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Please register workers in the Worker Registry to start recording attendance.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Worker Name &amp; Trade</th>
                  <th className="py-3.5 px-6">Assigned Site</th>
                  <th className="py-3.5 px-6 text-center">Daily Wage Rate</th>
                  <th className="py-3.5 px-6 text-center">Mark Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {attendanceList.map((item) => {
                  const worker = item.worker;
                  const currentStatus = item.status;

                  return (
                    <tr key={worker._id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm">{worker.name}</div>
                        <div className="text-[11px] text-slate-500">{worker.role || 'Laborer'} • {worker.phone}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-800">
                          {worker.assignedProject?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-bold text-slate-900">₹{worker.dailyWageRate}</span>
                        <span className="text-[10px] text-slate-400 block">per full day</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          {/* Present Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(worker._id, 'Present')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          {/* Half-day Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(worker._id, 'Half-day')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              currentStatus === 'Half-day'
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-500/40'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Half-day</span>
                          </button>

                          {/* Absent Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(worker._id, 'Absent')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-500/40'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
