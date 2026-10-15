import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiCalendar, FiUser, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { getImageUrl } from '../utils/imageUrl.js';

const pageMeta = {
  '/': { title: 'Dashboard', desc: 'Financial overview & analytics' },
  '/transactions': { title: 'Transactions', desc: 'Manage your income & expenses' },
  '/categories': { title: 'Categories', desc: 'Organize transaction labels' },
  '/budget': { title: 'Monthly Budget', desc: 'Monitor your spending targets' },
  '/profile': { title: 'Account Settings', desc: 'Personal details & security' },
};

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.profilePicture]);

  const currentMeta = pageMeta[pathname] || { title: 'Finance Tracker', desc: 'Track your money' };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-slate-200/80 transition-all">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Left: Mobile menu toggle + Page title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
            onClick={onMenuClick}
            aria-label="Open sidebar menu"
          >
            <FiMenu size={22} />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              {currentMeta.title}
            </h1>
            <p className="hidden md:block text-xs font-medium text-slate-600">
              {currentMeta.desc}
            </p>
          </div>
        </div>

        {/* Right: Date badge + Quick action + User info */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Today's date pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs font-medium text-slate-600">
            <FiCalendar size={13} className="text-blue-500" />
            <span>{todayFormatted}</span>
          </div>

          {/* User Profile Pill Link */}
          <Link
            to="/profile"
            className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200/80 group"
          >
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">
                {user?.name || 'My Account'}
              </p>
              <p className="text-[11px] font-medium text-slate-600 truncate max-w-[130px]">
                {user?.email}
              </p>
            </div>

            <div className="relative">
              {user?.profilePicture && !imgError ? (
                <img
                  src={getImageUrl(user.profilePicture)}
                  alt={user.name}
                  onError={() => setImgError(true)}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/20 shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <FiUser size={16} />}
                </div>
              )}
              {/* Online indicator dot */}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-500/30" />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;