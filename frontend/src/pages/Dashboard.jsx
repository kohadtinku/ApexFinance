import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { currency } from '../utils/currency.js';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiArrowRight,
  FiList,
  FiPlus,
  FiPieChart,
  FiActivity,
  FiCreditCard,
  FiCheckCircle,
} from 'react-icons/fi';
import { TbCurrencyRupee } from 'react-icons/tb';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import TransactionForm from '../components/TransactionForm.jsx';

const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#6366f1', // Indigo
];

// Sleek Custom Tooltip for Charts
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700/60 text-xs space-y-1.5">
        <p className="font-bold text-slate-300 border-b border-slate-700 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300">{entry.name}:</span>
            </span>
            <span className="font-bold text-white">{currency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/90 backdrop-blur-md text-white p-2.5 rounded-xl shadow-xl border border-slate-700/60 text-xs">
        <p className="font-semibold text-slate-300">{data.name}</p>
        <p className="font-extrabold text-sm text-white mt-0.5">{currency(data.value)}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/transactions/stats/dashboard');
      setStats(data.stats);
    } catch (err) {
      toast.error(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <Loader text="Assembling financial dashboard..." />;
  if (!stats) return <EmptyState title="No financial data available" />;

  const netSavings = (stats.monthIncome || 0) - (stats.monthExpense || 0);

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-lg shadow-blue-600/15">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 mb-3 border border-white/20">
              <FiCheckCircle className="text-emerald-400" size={13} />
              <span>Real-Time Financial Overview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Member'}! 👋
            </h2>
            <p className="mt-1.5 text-blue-100 text-xs sm:text-sm leading-relaxed">
              Track your earnings, monitor monthly budgets, and optimize your spending with ease.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setQuickAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs sm:text-sm shadow-md hover:bg-blue-50 active:scale-95 transition-all"
            >
              <FiPlus size={18} className="stroke-[2.5]" />
              <span>Add Transaction</span>
            </button>
            <Link
              to="/budget"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800/60 hover:bg-blue-800/90 text-white font-semibold text-xs sm:text-sm border border-white/20 active:scale-95 transition-all"
            >
              <FiCreditCard size={17} />
              <span>Check Budget</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Net Balance"
          value={currency(stats.totalBalance)}
          icon={TbCurrencyRupee}
          color={stats.totalBalance >= 0 ? 'primary' : 'red'}
          subtitle="All accounts cumulative"
        />
        <StatCard
          title="This Month Income"
          value={currency(stats.monthIncome)}
          icon={FiTrendingUp}
          color="green"
          subtitle="Monthly cash inflow"
        />
        <StatCard
          title="This Month Expense"
          value={currency(stats.monthExpense)}
          icon={FiTrendingDown}
          color="red"
          subtitle="Monthly cash outflow"
        />
        <StatCard
          title="Net Cashflow"
          value={currency(netSavings)}
          icon={FiActivity}
          color={netSavings >= 0 ? 'green' : 'amber'}
          subtitle={netSavings >= 0 ? 'Positive monthly cashflow' : 'Negative monthly cashflow'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="card lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FiActivity className="text-blue-600" />
                <span>Cashflow Trend</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Income vs Expenses for the last 6 months
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expense
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyTrend} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={11}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="income"
                  fill="#10b981"
                  name="Income"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="expense"
                  fill="#f43f5e"
                  name="Expense"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Donut Chart */}
        <div className="card lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FiPieChart className="text-indigo-600" />
                <span>Top Expenses</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Category distribution</p>
            </div>
          </div>

          {stats.categoryBreakdown.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <FiPieChart size={24} />
              </div>
              <p className="text-xs font-semibold text-slate-600">No expenses recorded this month</p>
              <p className="text-[11px] text-slate-600 mt-1">Expenses will appear here as you log them</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              <div className="h-52 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {stats.categoryBreakdown.map((_, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Pills List */}
              <div className="space-y-2 mt-2 pt-3 border-t border-slate-100 max-h-36 overflow-y-auto">
                {stats.categoryBreakdown.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="font-semibold text-slate-700 truncate">{cat.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{currency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="card">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FiList className="text-blue-600" />
              <span>Recent Transactions</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Latest transactions recorded on your account
            </p>
          </div>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 hover:gap-2 transition-all p-1"
          >
            <span>View All</span>
            <FiArrowRight size={14} />
          </Link>
        </div>

        {stats.recentTransactions.length === 0 ? (
          <EmptyState
            icon={FiList}
            title="No recent transactions"
            description="Start logging your expenses and income to see them organized here."
            action={
              <button
                onClick={() => setQuickAddOpen(true)}
                className="btn-primary"
              >
                <FiPlus size={16} /> Add First Transaction
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentTransactions.map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <FiTrendingUp size={20} className="stroke-[2.5]" />
                    ) : (
                      <FiTrendingDown size={20} className="stroke-[2.5]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate group-hover:text-blue-600 transition">
                      {tx.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-600">
                      <span className="badge-slate text-[11px] font-semibold">{tx.category}</span>
                      <span>•</span>
                      <span>{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span
                    className={`text-sm sm:text-base font-extrabold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {currency(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Transaction Modal */}
      <Modal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        title="Add New Transaction"
        size="lg"
      >
        <TransactionForm
          onSuccess={() => {
            setQuickAddOpen(false);
            fetchStats();
          }}
          onCancel={() => setQuickAddOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;