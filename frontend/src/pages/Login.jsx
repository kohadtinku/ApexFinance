import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  FiTrendingUp,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiShield,
  FiArrowRight,
} from 'react-icons/fi';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('All fields are required');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Feature Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <FiTrendingUp size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight">ApexFinance</span>
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-md">
              Pro
            </span>
          </div>
        </div>

        {/* Center Content & Glass Card */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-4 text-white">
            Smart financial control, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
              simplified.
            </span>
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            Track daily transactions, keep budgets disciplined, and discover actionable spending insights in one unified dashboard.
          </p>

          {/* Interactive Mock Preview Card with ₹ */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FiCheckCircle size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Monthly Savings Target</p>
                  <p className="text-[11px] text-slate-300">September 2026</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                +24.8%
              </span>
            </div>

            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full w-3/4" />
            </div>

            <div className="flex justify-between text-xs text-slate-300">
              <span>Saved: ₹32,500.00</span>
              <span className="font-semibold text-white">Goal: ₹40,000.00</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5">
            <FiShield className="text-emerald-400" /> Bank-grade security
          </span>
          <span>© {new Date().getFullYear()} ApexFinance</span>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <FiTrendingUp size={22} className="stroke-[2.5]" />
            </div>
            <span className="text-xl font-extrabold text-slate-900">ApexFinance</span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to manage and review your finances
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="input input-icon-left"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input input-icon-both"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary w-full !py-3 text-sm font-bold shadow-lg shadow-blue-500/25"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <FiArrowRight size={16} />
                  </span>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs sm:text-sm text-slate-500">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;