import React, { useState, useEffect } from 'react';
import {
  ReceiptText,
  Smartphone,
  Landmark,
  Banknote,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CreditCard,
  Building2,
} from 'lucide-react';
import { paymentApi } from '../services/api';

export default function Ledger() {
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLedger = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const params = {};
      if (selectedMethod !== 'All') params.paymentMethod = selectedMethod;

      const res = await paymentApi.getLedger(params);
      setTransactions(res.data.data || []);
      setTotalAmount(res.data.totalAmount || 0);
      setLoading(false);
    } catch (err) {
      setErrorMsg('Failed to load payment ledger');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [selectedMethod]);

  const filteredTransactions = transactions.filter((t) => {
    const workerName = t.workerId?.name || '';
    const workerPhone = t.workerId?.phone || '';
    const ref = t.transactionReference || '';
    const query = search.toLowerCase();

    return (
      workerName.toLowerCase().includes(query) ||
      workerPhone.includes(query) ||
      ref.toLowerCase().includes(query)
    );
  });

  // Method breakdown counts
  const phonePeCount = transactions.filter((t) => t.paymentMethod === 'PhonePe').length;
  const netbankingCount = transactions.filter((t) => t.paymentMethod === 'Netbanking').length;
  const cashCount = transactions.filter((t) => t.paymentMethod === 'Cash').length;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Payment Checkout Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of all salary disbursals executed via PhonePe, Netbanking, or Cash.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Audit-Ready Ledger</span>
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Disbursed</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹{totalAmount.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">{transactions.length} total transactions</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-purple-100 bg-purple-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">PhonePe UPI</span>
            <Smartphone className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-2xl font-black text-purple-900 mt-1">{phonePeCount} Txns</h3>
          <p className="text-xs text-purple-700 mt-1">Instant mobile UPI clearance</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-100 bg-blue-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Netbanking</span>
            <Landmark className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-blue-900 mt-1">{netbankingCount} Txns</h3>
          <p className="text-xs text-blue-700 mt-1">Corporate bank transfers</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-100 bg-emerald-50/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Cash Vouchers</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-emerald-900 mt-1">{cashCount} Txns</h3>
          <p className="text-xs text-emerald-700 mt-1">On-site cash disbursements</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by worker name, phone, txn ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'PhonePe', 'Netbanking', 'Cash'].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMethod(m)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMethod === m
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm font-medium">
          Loading payment ledger...
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <ReceiptText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-base">No ledger entries found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Disburse salaries in the Payroll view to record simulated PhonePe, Netbanking, or Cash transactions.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Transaction Ref</th>
                  <th className="py-3.5 px-6">Worker &amp; Site</th>
                  <th className="py-3.5 px-6">Payment Method</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6">Date &amp; Time</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6">Disbursement Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {tx.transactionReference}
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{tx.workerId?.name || 'Worker'}</div>
                      <div className="text-[11px] text-slate-500">{tx.workerId?.phone}</div>
                      <div className="text-[10px] text-slate-400">
                        {tx.workerId?.assignedProject?.name || ''}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tx.paymentMethod === 'PhonePe'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : tx.paymentMethod === 'Netbanking'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {tx.paymentMethod === 'PhonePe' && <Smartphone className="w-3 h-3" />}
                        {tx.paymentMethod === 'Netbanking' && <Landmark className="w-3 h-3" />}
                        {tx.paymentMethod === 'Cash' && <Banknote className="w-3 h-3" />}
                        <span>{tx.paymentMethod}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right font-black text-slate-900 text-sm">
                      ₹{tx.amount.toLocaleString()}
                    </td>

                    <td className="py-4 px-6 text-slate-600">
                      <div>
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          tx.status === 'Paid' || tx.status === 'Success'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : tx.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {(tx.status === 'Paid' || tx.status === 'Success') && <CheckCircle2 className="w-3 h-3" />}
                        {tx.status === 'Pending' && <Clock className="w-3 h-3" />}
                        <span>{tx.status === 'Success' ? 'Paid' : tx.status}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 text-[11px] text-slate-500">
                      <div className="flex items-center justify-between gap-2">
                        <div className="max-w-xs truncate">
                          {tx.details?.phoneNumber && <span>PhonePe: {tx.details.phoneNumber} • </span>}
                          {tx.details?.bankName && <span>Bank: {tx.details.bankName} • </span>}
                          <span>{tx.details?.notes || 'Cleared'}</span>
                        </div>
                        {tx.status === 'Pending' && (
                          <button
                            onClick={async () => {
                              try {
                                await paymentApi.confirm(tx._id);
                                fetchLedger();
                              } catch (e) {
                                alert('Failed to confirm payment');
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shrink-0 transition-colors shadow-xs"
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
