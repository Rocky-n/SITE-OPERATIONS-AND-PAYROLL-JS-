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
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
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
  const [todayAttendance, setTodayAttendance] = useState({ oneDay: 0, onePointFive: 0, halfDay: 0, absent: 0, total: 0 });
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  const [payrollTrends, setPayrollTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);

  // Helper to generate empty 7 days fallback
  const generateDefaultDays = () => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      list.push({
        date: key,
        label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        workers: 0,
      });
    }
    return list;
  };

  // Helper to build 7-day financial trend from ledger
  const buildPayrollTrends = (transactions) => {
    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dayMap[key] = {
        date: key,
        label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        amount: 0,
      };
    }

    if (Array.isArray(transactions)) {
      transactions.forEach((tx) => {
        if (!tx || !tx.date) return;
        const txDate = new Date(tx.date).toISOString().split('T')[0];
        if (dayMap[txDate]) {
          dayMap[txDate].amount += Number(tx.amount || 0);
        }
      });
    }

    return Object.values(dayMap);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [projRes, workRes, payRes, ledgerRes, attRes, trendRes] = await Promise.all([
        projectApi.getAll(),
        workerApi.getAll(),
        payrollApi.getReport(),
        paymentApi.getLedger(),
        attendanceApi.getByDate({ date: today }),
        attendanceApi.getTrends(7).catch(() => ({ data: { data: [] } })),
      ]);

      const projs = Array.isArray(projRes?.data?.data) ? projRes.data.data : [];
      const works = Array.isArray(workRes?.data?.data) ? workRes.data.data : [];
      const payrollSummary = payRes?.data?.summary || {};
      const ledger = Array.isArray(ledgerRes?.data?.data) ? ledgerRes.data.data : [];
      const attendance = Array.isArray(attRes?.data?.data) ? attRes.data.data : [];
      const fetchedTrends = Array.isArray(trendRes?.data?.data) ? trendRes.data.data : [];

      setProjects(projs);
      setWorkers(works);
      setRecentPayments(ledger.slice(0, 5));

      // Compute attendance counts today
      let oneDay = 0, onePointFive = 0, halfDay = 0, absent = 0;
      attendance.forEach((a) => {
        if (!a) return;
        if (a.status === '1 Day' || a.status === 'Present') oneDay++;
        else if (a.status === '1.5 Days') onePointFive++;
        else if (a.status === 'Half-day') halfDay++;
        else if (a.status === 'Absent') absent++;
      });

      setTodayAttendance({
        oneDay,
        onePointFive,
        halfDay,
        absent,
        total: attendance.length,
      });

      // Attendance 7-day trend
      if (fetchedTrends.length > 0) {
        setAttendanceTrends(fetchedTrends);
      } else {
        setAttendanceTrends(generateDefaultDays());
      }

      // Payroll financial trend
      setPayrollTrends(buildPayrollTrends(ledger) || []);

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

  // Pulse loading skeleton for Dashboard
  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />

        {/* 4 Stat Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>

        {/* 2 Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Two Column Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-5 sm:p-6 rounded-3xl shadow-xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-semibold uppercase tracking-wider">
            Site Operations Hub
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold mt-2">Construction Management Overview</h2>
          <p className="text-slate-300 text-xs mt-1">
            Real-time tracking of site workforces, daily attendance, advances, and payroll clearances.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsAdvanceOpen(true)}
            className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all shadow-sm cursor-pointer min-h-[44px]"
          >
            <HandCoins className="w-4 h-4 text-orange-400" />
            <span>Issue Advance</span>
          </button>
          <button
            onClick={() => setIsProjectOpen(true)}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-600/30 flex items-center gap-2 transition-all cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>New Site</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          title="Active Workers"
          value={stats.activeWorkers}
          subtitle="Registered labor force"
          icon={Users}
          color="orange"
          trend={
            <button
              onClick={() => setActiveTab('workers')}
              className="text-orange-600 hover:text-orange-700 flex items-center gap-1 font-semibold cursor-pointer"
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
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold cursor-pointer"
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
              className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-semibold cursor-pointer"
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
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Process payroll</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          }
        />
      </div>

      {/* 4. Interactive Dashboard Analytics (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Attendance Trends (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Attendance Trends</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Workers on site (1 Day &amp; 1.5 Days) over the last 7 days
              </p>
            </div>
            <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 rounded-lg text-xs font-semibold">
              Last 7 Days
            </span>
          </div>

          <div className="h-[300px] w-full pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(234, 88, 12, 0.08)' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  formatter={(value) => [`${value} Workers`, 'Present']}
                />
                <Bar dataKey="workers" fill="#ea580c" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Payroll Expenses (Area Chart) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Payroll Expenses</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Financial disbursements trend (₹) over the last 7 days
              </p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold">
              Payouts
            </span>
          </div>

          <div className="h-[300px] w-full pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={payrollTrends || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Disbursed']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPayout)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Projects & Attendance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Attendance Snapshot */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Today's Attendance Status</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live roster for {new Date().toLocaleDateString('en-IN')}</p>
              </div>
              <button
                onClick={() => setActiveTab('attendance')}
                className="px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Mark Attendance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 text-center">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">1 Day</span>
                <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{todayAttendance.oneDay}</h4>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Full day wage</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800 text-center">
                <span className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">1.5 Days</span>
                <h4 className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">{todayAttendance.onePointFive}</h4>
                <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">150% daily wage</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800 text-center">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Half-Day</span>
                <h4 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{todayAttendance.halfDay}</h4>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">50% daily wage</p>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800 text-center">
                <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">Absent</span>
                <h4 className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{todayAttendance.absent}</h4>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">Zero wage</p>
              </div>
            </div>
          </div>

          {/* Active Sites / Running Applications */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Running Construction Sites</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active project deployments and labor allocations</p>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold cursor-pointer"
              >
                View all ({projects.length})
              </button>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 3).map((project) => (
                <div
                  key={project._id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-900/60 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{project.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          project.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{project.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 justify-end">
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Disbursements</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live ledger stream</p>
              </div>
              <button
                onClick={() => setActiveTab('ledger')}
                className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-semibold cursor-pointer"
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
                    className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.workerId?.name || 'Worker'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            p.paymentMethod?.includes('PhonePe') || p.paymentMethod === 'UPI'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                              : p.paymentMethod?.includes('Netbanking')
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
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
                      <span className="font-bold text-slate-900 dark:text-white text-sm">₹{p.amount.toLocaleString()}</span>
                      <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Success</span>
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
