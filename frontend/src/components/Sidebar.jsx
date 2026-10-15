import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  FiHome,
  FiList,
  FiTag,
  FiTarget,
  FiUser,
  FiLogOut,
  FiX,
  FiTrendingUp,
  FiShield,
  FiChevronRight,
} from 'react-icons/fi';

const navItems = [
  { to: '/', label: 'Dashboard', icon: FiHome },
  { to: '/transactions', label: 'Transactions', icon: FiList },
  { to: '/categories', label: 'Categories', icon: FiTag },
  { to: '/budget', label: 'Monthly Budget', icon: FiTarget },
  { to: '/profile', label: 'Profile Settings', icon: FiUser },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop overlay with blur */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-72 h-screen bg-white/95 backdrop-blur-md border-r border-slate-200/90 flex flex-col transform transition-transform duration-300 ease-out shadow-xl lg:shadow-none ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <Link to="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <FiTrendingUp size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  ApexFinance
                </span>
                {/* <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-200 rounded-md">
                  Pro
                </span> */}
              </div>
              <p className="text-[11px] font-medium text-slate-600">Smart Financial Suite</p>
            </div>
          </Link>

          <button
            type="button"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-95"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* User Card */}
       

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      size={19}
                      className={`transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-600 group-hover:text-blue-600'
                      }`}
                    />
                    <span>{label}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Security / Pro Tip widget */}
        {/* <div className="p-4 mx-3 mb-2 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-1.5">
            <FiShield className="text-emerald-400" size={16} />
            <span className="text-xs font-bold text-slate-200">Bank-Grade Secure</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Your transactions and receipts are protected with 256-bit encryption.
          </p>
        </div> */}

        {/* Logout Footer */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            type="button"
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50/80 active:scale-[0.98] transition-all border border-transparent hover:border-rose-200"
          >
            <FiLogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;