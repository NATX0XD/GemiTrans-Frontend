import React from 'react';
import { Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import useQuota from '../../../hooks/useQuota';

const QuotaMiniBar = () => {
    const { used, limit, percentage, isNearLimit, isOverLimit, loading, uid } = useQuota();

    if (loading || !uid) return null;

    const barColor = isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-indigo-500';
    const textColor = isOverLimit ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400';

    return (
        <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {isNearLimit ? (
                        <AlertTriangle size={14} className={isOverLimit ? 'text-red-500' : 'text-amber-500'} />
                    ) : (
                        <Zap size={14} className="text-indigo-500" />
                    )}
                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                        Daily Quota
                    </span>
                </div>
                <span className={`text-[10px] font-bold ${textColor}`}>
                    {used.toLocaleString()} / {limit.toLocaleString()}
                </span>
            </div>
            
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full ${barColor} transition-colors duration-500 shadow-[0_0_8px_rgba(99,102,241,0.2)]`}
                />
            </div>
            
            {isNearLimit && !isOverLimit && (
                <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1 animate-pulse">
                   ⚠️ Running low on tokens
                </p>
            )}
            {isOverLimit && (
                <p className="text-[9px] font-bold text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                   ❌ Limit reached. Please upgrade.
                </p>
            )}
        </div>
    );
};

export default QuotaMiniBar;
