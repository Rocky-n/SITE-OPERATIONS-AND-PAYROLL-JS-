import React, { useState, useEffect } from 'react';
import {
  HandCoins,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Banknote,
  Landmark,
  Smartphone,
  Users,
} from 'lucide-react';
import AdvanceModal from '../components/AdvanceModal';
import { advanceApi, workerApi } from '../services/api';

export default function Advances() {
  const [advances, setAdvances] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [totalAdvances, setTotalAdvances] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedWorker) params.workerId = selectedWorker;

      const [advRes, workRes] = await Promise.all([
        advanceApi.getAll(params),
        workerApi.getAll(),
      ]);

      setAdvances(advRes.data.data || []);
      setTotalAdvances(advRes.data.totalAdvances || 0);
      setWorkers(workRes.data.data || []);
      setLoading(false);
    } catch (err) {
      setErrorMsg('Failed to load advances');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWorker]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advance record? It will adjust the worker net payable.')) return;
    try {
      await advanceApi.delete(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete advance record');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Wage Advances Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record cash, bank, or UPI advances. Automatically deducted from worker payroll.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Advance</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Summary Card & Filters */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-600">
            <HandCoins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Wage Advances Disbursed</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">₹{totalAdvances.toLocaleString()}</h3>
            <p className="text-xs text-amber-700 font-medium mt-0.5">
              Across {advances.length} recorded advance transactions
            </p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Filter By Worker
          </label>
          <select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Workers</option>
            {workers.map((w) => (
              <option key={w._id} value={w._id}>{w.name} ({w.phone})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advances Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm font-medium">
          Loading advances data...
        </div>
      ) : advances.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <HandCoins className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">No advance disbursements found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            When workers request cash or UPI advances against their wages, record them here to automatically deduct from payroll.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Worker</th>
                  <th className="py-3.5 px-6">Disbursement Date</th>
                  <th className="py-3.5 px-6">Mode</th>
                  <th className="py-3.5 px-6">Purpose / Reason</th>
                  <th className="py-3.5 px-6 text-right">Advance Amount</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {advances.map((adv) => (
                  <tr key={adv._id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{adv.workerId?.name || 'Worker'}</div>
                      <div className="text-[11px] text-slate-500">{adv.workerId?.phone}</div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {new Date(adv.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          adv.paymentMode === 'Cash'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : adv.paymentMode === 'UPI'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {adv.paymentMode === 'Cash' && <Banknote className="w-3 h-3" />}
                        {adv.paymentMode === 'UPI' && <Smartphone className="w-3 h-3" />}
                        {adv.paymentMode === 'Bank Transfer' && <Landmark className="w-3 h-3" />}
                        <span>{adv.paymentMode}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 max-w-xs truncate">
                      {adv.reason || 'Advance against wages'}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900 text-sm">
                      ₹{adv.amount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(adv._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Advance"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Advance Modal */}
      <AdvanceModal
        workers={workers}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
