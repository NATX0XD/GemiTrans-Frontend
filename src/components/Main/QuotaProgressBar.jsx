import React, { useState, useEffect } from 'react';
import { db, auth } from '../../configuration/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Database, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuotaProgressBar = () => {
    const [quota, setQuota] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uid, setUid] = useState(null);

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUid(user.uid);
            } else {
                setUid(null);
                setQuota(null);
                setLoading(false);
            }
        });
        return () => unsubAuth();
    }, []);

    useEffect(() => {
        if (!uid) return;

        const quotaRef = doc(db, 'users_quota', uid);
        const unsubscribe = onSnapshot(quotaRef, (doc) => {
            if (doc.exists()) {
                setQuota(doc.data());
            } else {
                // If doc doesn't exists, backend usually creates it on first call
                // but we can set a placeholder
                setQuota({ tokens_today: 0, daily_limit: 10000 });
            }
            setLoading(false);
        }, (err) => {
            console.error("Quota Firestore error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [uid]);

    if (loading || !uid) return null;

    const used = quota?.tokens_today || 0;
    const limit = quota?.daily_limit || 10000;
    const percentage = Math.min(Math.round((used / limit) * 100), 100);
    
    // Aesthetic colors
    const isOverLimit = used >= limit;
    const isNearLimit = percentage > 85;
    
    const barColor = isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-indigo-500';
    const textColor = isOverLimit ? 'text-red-600 dark:text-red-400' : isNearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl mx-auto px-4 mt-6 mb-2"
        >
            <div className="relative overflow-hidden rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-4 shadow-sm group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Label & Icon */}
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isOverLimit ? 'bg-red-100/80 text-red-600' : 'bg-indigo-100/80 text-indigo-600'} dark:bg-slate-800 transition-colors`}>
                            {isOverLimit ? <Info size={18} /> : <Zap size={18} />}
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                                Daily Token Quota
                                {isOverLimit && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Limit Reached</span>}
                            </h4>
                            <p className={`text-xs font-bold ${textColor}`}>
                                {used.toLocaleString()} / {limit.toLocaleString()} tokens used
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="flex-1 max-w-md w-full">
                        <div className="h-2.5 w-full bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden relative">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${barColor} shadow-[0_0_12px_rgba(99,102,241,0.3)]`}
                            />
                        </div>
                        <div className="flex justify-between mt-1.5">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{percentage}% Consumed</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resets Daily</span>
                        </div>
                    </div>
                </div>

                {/* Decorative background glow */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 blur-[80px] rounded-full pointer-events-none transition-colors duration-1000 ${isOverLimit ? 'bg-red-500/10' : 'bg-indigo-500/10'}`}></div>
            </div>
        </motion.div>
    );
};

export default QuotaProgressBar;
