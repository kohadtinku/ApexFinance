import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend }) => {
  const colorThemes = {
    primary: {
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25',
      badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200/60',
      accentGlow: 'bg-blue-500/5',
      borderAccent: 'hover:border-blue-300',
    },
    green: {
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25',
      badgeBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
      accentGlow: 'bg-emerald-500/5',
      borderAccent: 'hover:border-emerald-300',
    },
    red: {
      iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25',
      badgeBg: 'bg-rose-50 text-rose-700 border border-rose-200/60',
      accentGlow: 'bg-rose-500/5',
      borderAccent: 'hover:border-rose-300',
    },
    amber: {
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25',
      badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200/60',
      accentGlow: 'bg-amber-500/5',
      borderAccent: 'hover:border-amber-300',
    },
  };

  const theme = colorThemes[color] || colorThemes.primary;

  return (
    <div
      className={`relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group ${theme.borderAccent}`}
    >
      {/* Decorative ambient background blur */}
      <div
        className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full ${theme.accentGlow} blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
            {title}
          </p>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1.5 text-xs font-medium text-slate-600 truncate flex items-center gap-1.5">
              <span>{subtitle}</span>
            </p>
          )}
          {trend && (
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full">
              {trend}
            </div>
          )}
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${theme.iconBg}`}
        >
          <Icon size={22} className="drop-shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;