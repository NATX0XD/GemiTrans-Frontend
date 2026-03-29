import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-slate-900/60 p-6 pt-7 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col h-[200px] animate-pulse transition-colors duration-500">
      {/* Header/Title block */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-2/3"></div>
        <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800/50 rounded-full"></div>
      </div>
      
      {/* Small Badge block */}
      <div className="h-4 bg-slate-50 dark:bg-slate-800/50 rounded-md w-1/4 mb-5"></div>
      
      {/* Content lines */}
      <div className="space-y-3 flex-1">
        <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-full"></div>
        <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-full"></div>
        <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-4/5"></div>
      </div>

      {/* Footer block */}
      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between">
        <div className="h-2 bg-slate-50 dark:bg-slate-800/50 rounded w-16"></div>
        <div className="h-2 bg-slate-50 dark:bg-slate-800/50 rounded w-12"></div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default SkeletonCard;
