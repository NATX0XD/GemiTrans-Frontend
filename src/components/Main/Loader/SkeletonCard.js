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

export const SkeletonHeader = ({ showSearch = false }) => {
  return (
    <div className="flex flex-col gap-6 mb-10 animate-pulse transition-colors duration-500">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Title & Badge */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800/50 rounded-full hidden sm:block"></div>
          </div>
          <div className="h-4 w-64 bg-slate-50 dark:bg-slate-800/30 rounded-md mt-1"></div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          <div className="flex items-center gap-2 p-1 bg-white/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-full h-11 w-24"></div>
          <div className="h-11 w-32 bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-full"></div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="h-12 w-full lg:w-96 bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl"></div>
      )}
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
