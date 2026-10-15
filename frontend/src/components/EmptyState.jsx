import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-14 px-6 text-center animate-fade-in">
    {Icon && (
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-blue-500/10 rounded-3xl blur-xl" />
        <div className="relative w-16 h-16 bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-center shadow-sm text-slate-400">
          <Icon size={28} className="stroke-[1.75]" />
        </div>
      </div>
    )}
    <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
      {title}
    </h3>
    {description && (
      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
        {description}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;