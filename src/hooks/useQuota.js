import { useState, useEffect } from 'react';
import { db, auth } from '../configuration/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const useQuota = () => {
    const [quota, setQuota] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uid, setUid] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUid(user.uid);
            } else {
                setUid(null);
                setQuota(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!uid) return;

        const quotaRef = doc(db, 'users_quota', uid);
        const unsubscribe = onSnapshot(quotaRef, (doc) => {
            if (doc.exists()) {
                setQuota(doc.data());
            } else {
                setQuota({ tokens_today: 0, daily_limit: 10000 });
            }
            setLoading(false);
        }, (err) => {
            console.error("useQuota Firestore error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [uid]);

    const used = quota?.tokens_today || 0;
    const limit = quota?.daily_limit || 10000;
    const percentage = Math.min((used / limit) * 100, 100);
    const isNearLimit = percentage >= 90;
    const isOverLimit = used >= limit;

    return { 
        quota, 
        loading, 
        used, 
        limit, 
        percentage, 
        isNearLimit, 
        isOverLimit,
        uid 
    };
};

export default useQuota;
