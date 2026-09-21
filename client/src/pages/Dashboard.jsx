import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  CalendarCheck2,
  HandCoins,
  Calculator,
  ReceiptText,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import AdvanceModal from '../components/AdvanceModal';
import ProjectModal from '../components/ProjectModal';
import { projectApi, workerApi, payrollApi, paymentApi, attendanceApi } from '../services/api';

export default function Dashboard({ setActiveTab }) {
  const [stats, setStats] = useState({
    activeWorkers: 0,
    activeProjects: 0,
    totalAdvances: 0,
    netPayable: 0,
    totalEarned: 0,
    totalPaid: 0,
  });
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState({ present: 0, halfDay: 0, absent: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [projRes, workRes, payRes, ledgerRes, attRes] = await Promise.all([
        projectApi.getAll(),
        workerApi.getAll(),
        payrollApi.getReport(),
        paymentApi.getLedger(),
        attendanceApi.getByDate({ date: today }),
      ]);

      const projs = projRes.data.data || [];
      const works = workRes.data.data || [];
      const payrollSummary = payRes.data.summary || {};
      const ledger = ledgerRes.data.data || [];
      const attendance = attRes.data.data || [];

      setProjects(projs);
      setWorkers(works);
      setRecentPayments(ledger.slice(0, 5));

      // Compute attendance counts today
      let present = 0, halfDay = 0, absent = 0;
      attendance.forEach((a) => {
        if (a.status === 'Present') present++;
        else if (a.status === 'Half-day') halfDay++;
        else if (a.status === 'Absent') absent++;
      });

      setTodayAttendance({
        present,
        halfDay,
        absent,
        total: attendance.length,
      });

      setStats({
        activeWorkers: works.filter((w) => w.status === 'Active').length,
        activeProjects: projs.filter((p) => p.status === 'Active').length,
        totalAdvances: payrollSummary.totalAdvances || 0,
        netPayable: payrollSummary.totalNetPayable || 0,
        totalEarned: payrollSummary.totalEarned || 0,
        totalPaid: payrollSummary.totalPaid || 0,
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-6 rounded-3xl shadow-xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-semibold uppercase tracking-wider">
            Site Operations Hub
          </span>
          <h2 className="text-2xl font-extrabold mt-2">Construction Management Overview</h2>
          <p className="text-slate-300 text-xs mt-1">
            Real-time tracking of site workforces, daily attendance, advances, and payroll clearances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdvanceOpen(true)}
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
          >
            <HandCoins className="w-4 h-4 text-orange-400" />
            <span>Issue Advance</span>
          </button>
          <button
            onClick={() => setIsProjectOpen(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Site</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Workers"
          value={stats.activeWorkers}
          subtitle="Registered labor force"
          icon={Users}
          color="orange"
          trend={
            <button
              onClick={() => setActiveTab('workers')}
              className="text-orange-600 hover:text-orange-700 flex items-center gap-1 font-semibold"
            >
              <span>View directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />

        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          subtitle="Running construction sites"
          icon={Building2}
          color="blue"
          trend={
            <button
              onClick={() => setActiveTab('projects')}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
            >
              <span>View sites</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />

        <StatCard
          title="Total Advances Given"
          value={`₹${stats.totalAdvances.toLocaleString()}`}
          subtitle="Cash &amp; bank wage advances"
          icon={HandCoins}
          color="amber"
          trend={
            <button
              onClick={() => setActiveTab('advances')}
              className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-semibold"
            >
              <span>View advance ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />

        <StatCard
          title="Net Salary Payable"
          value={`₹${stats.netPayable.toLocaleString()}`}
          subtitle="Outstanding wage balance"
          icon={Calculator}
          color="emerald"
          trend={
            <button
              onClick={() => setActiveTab('payroll')}
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
            >
              <span>Process payroll</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Projects & Attendance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Attendance Snapshot */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Today's Attendance Status</h3>
                <p className="text-xs text-slate-500">Live roster for {new Date().toLocaleDateString('en-IN')}</p>
              </div>
              <button
                onClick={() => setActiveTab('attendance')}
                className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Mark Attendance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Present</span>
                <h4 className="text-2xl font-black text-emerald-700 mt-1">{todayAttendance.present}</h4>
                <p className="text-[11px] text-emerald-600 mt-0.5">Full day wage</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Half-Day</span>
                <h4 className="text-2xl font-black text-amber-700 mt-1">{todayAttendance.halfDay}</h4>
                <p className="text-[11px] text-amber-600 mt-0.5">50% daily wage</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
                <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Absent</span>
                <h4 className="text-2xl font-black text-rose-700 mt-1">{todayAttendance.absent}</h4>
                <p className="text-[11px] text-rose-600 mt-0.5">Zero wage</p>
              </div>
            </div>
          </div>

          {/* Active Sites / Running Applications */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Running Construction Sites</h3>
                <p className="text-xs text-slate-500">Active project deployments and labor allocations</p>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
              >
                View all ({projects.length})
              </button>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 3).map((project) => (
                <div
                  key={project._id}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-orange-200 bg-slate-50/50 hover:bg-orange-50/30 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{project.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          project.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{project.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 justify-end">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.workerCount || 0} Workers</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Started: {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Payments Ledger Snapshot */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Recent Disbursements</h3>
                <p className="text-xs text-slate-500">Live ledger stream</p>
              </div>
              <button
                onClick={() => setActiveTab('ledger')}
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
              >
                Full ledger
              </button>
            </div>

            {recentPayments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No payment transactions recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((p) => (
                  <div
                    key={p._id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{p.workerId?.name || 'Worker'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            p.paymentMethod === 'PhonePe'
                              ? 'bg-purple-100 text-purple-700'
                              : p.paymentMethod === 'Netbanking'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {p.paymentMethod}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(p.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 text-sm">₹{p.amount.toLocaleString()}</span>
                      <span className="block text-[10px] font-semibold text-emerald-600">Success</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdvanceModal
        workers={workers}
        isOpen={isAdvanceOpen}
        onClose={() => setIsAdvanceOpen(false)}
        onSuccess={fetchDashboardData}
      />

      <ProjectModal
        isOpen={isProjectOpen}
        onClose={() => setIsProjectOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
