import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { currency } from '../utils/currency.js';
import {
  FiTarget,
  FiEdit3,
  FiAlertTriangle,
  FiCheckCircle,
  FiCalendar,
  FiTrendingDown,
  FiPieChart,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { TbCurrencyRupee } from 'react-icons/tb';
import Loader from '../components/Loader.jsx';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const Budget = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/budget', { params: { month, year } });
      setBudget(data.budget);
      setAmount(data.budget?.amount || '');
    } catch (err) {
      toast.error(err.message || 'Failed to load budget');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return toast.error('Enter a valid amount');

    setSubmitting(true);
    try {
      await api.put('/budget', { amount: Number(amount), month, year });
      toast.success('Budget saved successfully');
      setEditing(false);
      fetchBudget();
    } catch (err) {
      toast.error(err.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 2 + i);

  if (loading) return <Loader text="Loading your monthly budget..." />;

  const { spent = 0, remaining = 0, percentage = 0, status = 'safe', amount: budgetAmount = 0 } = budget || {};

  const statusConfig = {
    safe: {
      bg: 'bg-emerald-50 border-emerald-200/80',
      text: 'text-emerald-800',
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      pill: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: FiCheckCircle,
      label: 'On Track',
      desc: 'Great job! Your spending is well within your budget limit.',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200/80',
      text: 'text-amber-800',
      bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
      pill: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: FiAlertTriangle,
      label: 'Approaching Limit',
      desc: `You have consumed ${percentage.toFixed(0)}% of your monthly allowance.`,
    },
    exceeded: {
      bg: 'bg-rose-50 border-rose-200/80',
      text: 'text-rose-800',
      bar: 'bg-gradient-to-r from-rose-500 to-pink-600',
      pill: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: FiAlertTriangle,
      label: 'Limit Exceeded',
      desc: `You have overspent by ${currency(spent - budgetAmount)}.`,
    },
  }[status] || {
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-800',
    bar: 'bg-blue-500',
    pill: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: FiCheckCircle,
    label: 'Normal',
    desc: '',
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Month & Year Navigator */}
      <div className="card !p-4 sm:!p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition active:scale-95"
              title="Previous Month"
            >
              <FiChevronLeft size={18} />
            </button>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <FiCalendar className="text-blue-600" />
                <span>
                  {months[month - 1]} {year}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Budget period target</p>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition active:scale-95"
              title="Next Month"
            >
              <FiChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="input !py-1.5 text-xs font-semibold cursor-pointer w-32"
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="input !py-1.5 text-xs font-semibold cursor-pointer w-24"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status Notice Banner */}
      {budgetAmount > 0 && (
        <div className={`p-4 sm:p-5 rounded-2xl border ${statusConfig.bg} flex items-start gap-4 transition-all shadow-sm`}>
          <div className="p-2 rounded-xl bg-white shadow-sm shrink-0">
            <StatusIcon size={22} className={statusConfig.text} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusConfig.pill}`}>
                {statusConfig.label}
              </span>
              <span className="text-xs text-slate-500">
                {percentage.toFixed(1)}% of budget used
              </span>
            </div>
            <p className={`text-sm font-semibold mt-1 ${statusConfig.text}`}>
              {statusConfig.desc}
            </p>
          </div>
        </div>
      )}

      {/* Main Budget Card */}
      <div className="card !p-6 sm:!p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <FiTarget size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Monthly Spending Limit
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Target expenditure for {months[month - 1]}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-secondary !py-2 text-xs font-bold self-start sm:self-auto"
            onClick={() => {
              setEditing((e) => !e);
              setAmount(budgetAmount || '');
            }}
          >
            <FiEdit3 size={15} />
            <span>{editing ? 'Cancel' : budgetAmount > 0 ? 'Edit Limit' : 'Set Limit'}</span>
          </button>
        </div>

        {/* Editing Mode */}
        {editing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4 animate-fade-in max-w-md">
            <div>
              <label className="label">Monthly Spending Limit (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input input-currency-left text-lg font-bold"
                  placeholder="e.g. 25000"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1.5">Quick Presets (INR):</p>
              <div className="flex flex-wrap gap-2">
                {[5000, 10000, 25000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-semibold transition"
                  >
                    ₹{preset >= 100000 ? `${preset / 100000} Lakh` : `${preset / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Monthly Budget'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : budgetAmount === 0 ? (
          /* Empty budget */
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <FiTarget size={30} />
            </div>
            <h4 className="text-base font-bold text-slate-900">No Budget Configured</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Set a monthly limit for {months[month - 1]} {year} to track and control your overall expenses.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setEditing(true)}
            >
              <FiTarget size={16} />
              <span>Define Budget Target</span>
            </button>
          </div>
        ) : (
          /* Active Budget Progress & Metrics */
          <div className="mt-6 space-y-6">
            {/* Progress Meter */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-600">Budget Consumed</span>
                <span className={statusConfig.text}>{percentage.toFixed(1)}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                <div
                  className={`h-full ${statusConfig.bar} rounded-full transition-all duration-700 shadow-sm`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total Budget
                  </span>
                  <TbCurrencyRupee className="text-slate-400" size={18} />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {currency(budgetAmount)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Assigned monthly limit</p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                    Total Spent
                  </span>
                  <FiTrendingDown className="text-rose-500" size={16} />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-rose-700">
                  {currency(spent)}
                </p>
                <p className="text-[11px] text-rose-600/80 mt-0.5">Recorded expenditure</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    Remaining
                  </span>
                  <FiCheckCircle className="text-emerald-500" size={16} />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                  {currency(remaining)}
                </p>
                <p className="text-[11px] text-emerald-600/80 mt-0.5">Available balance</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;