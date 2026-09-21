import React, { useState, useEffect } from 'react';
import {
  Calculator,
  HandCoins,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Building2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  Clock,
  Loader2,
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import AdvanceModal from '../components/AdvanceModal';
import { payrollApi, projectApi, paymentApi } from '../services/api';

export default function Payroll() {
  const [payrollData, setPayrollData] = useState([]);
  const [summary, setSummary] = useState({
    totalEarned: 0,
    totalAdvances: 0,
    totalPaid: 0,
    totalNetPayable: 0,
    paidWorkersCount: 0,
    pendingWorkersCount: 0,
    unpaidWorkersCount: 0,
    totalWorkers: 0,
  });
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [selectedWorkerForPay, setSelectedWorkerForPay] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceWorkerId, setAdvanceWorkerId] = useState('');

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const params = {};
      if (selectedProject) params.projectId = selectedProject;

      const [payRes, projRes] = await Promise.all([
        payrollApi.getReport(params),
        projectApi.getAll(),
      ]);

      setPayrollData(payRes.data.data || []);
      setSummary(payRes.data.summary || {});
      setProjects(projRes.data.data || []);
      setLoading(false);
    } catch (err) {
      setErrorMsg('Failed to compute payroll data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [selectedProject]);

  const handleOpenPayment = (item) => {
    setSelectedWorkerForPay(item);
    setIsPaymentModalOpen(true);
  };

  const handleIssueAdvance = (workerId) => {
    setAdvanceWorkerId(workerId);
    setIsAdvanceModalOpen(true);
  };

  // 3. UI Verification Step: 1-click confirmation without input or modal
  const handleConfirmPayment = async (pendingTransactionId) => {
    if (!pendingTransactionId) return;

    try {
      setConfirmingId(pendingTransactionId);
      await paymentApi.confirm(pendingTransactionId);
      await fetchPayroll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Dynamic Payroll Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-calculates salary up to date based on attendance, daily wage rate, and advances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-xs focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Construction Sites</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={fetchPayroll}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition-colors"
            title="Refresh Payroll"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Earned Wages</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹{summary.totalEarned?.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Gross labor earnings up to date</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Advances Deducted</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">- ₹{summary.totalAdvances?.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Direct wage advances taken</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Paid to Date</span>
          <h3 className="text-2xl font-black text-blue-600 mt-1">- ₹{summary.totalPaid?.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Confirmed payments disbursed</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-orange-200 bg-orange-50/30 shadow-xs">
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">Net Outstanding Payable</span>
          <h3 className="text-2xl font-black text-orange-600 mt-1">₹{summary.totalNetPayable?.toLocaleString()}</h3>
          <p className="text-xs text-orange-700 font-medium mt-1">
            {summary.unpaidWorkersCount} Unpaid • {summary.pendingWorkersCount || 0} Pending • {summary.paidWorkersCount} Paid
          </p>
        </div>
      </div>

      {/* Payroll Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm font-medium">
          Computing payroll &amp; checking transactions...
        </div>
      ) : payrollData.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">No payroll records found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Ensure active workers are registered and attendance has been marked.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Worker Details</th>
                  <th className="py-3.5 px-6">Daily Rate</th>
                  <th className="py-3.5 px-6 text-center">Attendance (P / H / A)</th>
                  <th className="py-3.5 px-6 text-right">Total Earned</th>
                  <th className="py-3.5 px-6 text-right">Advances</th>
                  <th className="py-3.5 px-6 text-right">Total Paid</th>
                  <th className="py-3.5 px-6 text-right">Net Payable</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {payrollData.map((item) => {
                  const worker = item.worker;
                  const isPaid = item.paymentStatus === 'Paid';
                  const isPending = item.paymentStatus === 'Pending';

                  return (
                    <tr key={worker._id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{worker.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {worker.role || 'Worker'} • {worker.phone}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Site: {worker.assignedProject?.name || 'Unassigned'}
                        </div>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-800">
                        ₹{worker.dailyWageRate}
                        <span className="text-[10px] text-slate-400 block font-normal">/ day</span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-1.5 font-bold font-mono">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {item.daysPresent}P
                          </span>
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {item.daysHalfDay}H
                          </span>
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            {item.daysAbsent}A
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        ₹{item.totalEarned.toLocaleString()}
                      </td>

                      <td className="py-4 px-6 text-right font-semibold text-amber-600">
                        {item.totalAdvances > 0 ? `- ₹${item.totalAdvances.toLocaleString()}` : '₹0'}
                      </td>

                      <td className="py-4 px-6 text-right font-semibold text-blue-600">
                        {item.totalPaid > 0 ? `- ₹${item.totalPaid.toLocaleString()}` : '₹0'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span className="text-base font-black text-orange-600">
                          ₹{item.netPayable.toLocaleString()}
                        </span>
                      </td>

                      {/* Status Badge: Paid (green), Pending (yellow), Unpaid (rose) */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isPending
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isPaid && <CheckCircle2 className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          <span>{item.paymentStatus}</span>
                        </span>
                      </td>

                      {/* Action Column */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleIssueAdvance(worker._id)}
                            title="Issue Advance"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors text-xs font-semibold"
                          >
                            <HandCoins className="w-4 h-4" />
                          </button>

                          {/* 3. If Pending: Show single "Confirm Payment" button */}
                          {isPending ? (
                            <button
                              onClick={() => handleConfirmPayment(item.pendingTransactionId)}
                              disabled={confirmingId === item.pendingTransactionId}
                              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                            >
                              {confirmingId === item.pendingTransactionId ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Confirming...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Confirm Payment</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenPayment(item)}
                              disabled={item.netPayable <= 0}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                item.netPayable > 0
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/30'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>{isPaid ? 'Paid' : 'Pay Worker'}</span>
                            </button>
                          )}
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

      {/* Payment Checkout Modal */}
      <PaymentModal
        worker={selectedWorkerForPay}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={fetchPayroll}
      />

      {/* Advance Modal */}
      <AdvanceModal
        workers={payrollData.map((d) => d.worker)}
        preselectedWorkerId={advanceWorkerId}
        isOpen={isAdvanceModalOpen}
        onClose={() => setIsAdvanceModalOpen(false)}
        onSuccess={fetchPayroll}
      />
    </div>
  );
}
