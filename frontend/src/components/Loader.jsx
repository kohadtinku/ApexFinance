import React from 'react';

const Loader = ({ text = 'Loading data...' }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 gap-3.5">
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
      <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
    </div>
    <p className="text-xs font-semibold text-slate-600 tracking-wide uppercase animate-pulse">
      {text}
    </p>
  </div>
);

export default Loader;