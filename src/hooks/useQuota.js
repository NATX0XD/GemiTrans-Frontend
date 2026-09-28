import { useState, useEffect } from 'react';
import { db, auth } from '../configuration/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { isQuotaDayCurrent } from '../services/quotaDay';

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
                setQuota({ tokens_today: 0, daily_limit: 10000, live_seconds_today: 0, live_seconds_limit: 600 });
            }
            setLoading(false);
        }, (err) => {
            console.error("useQuota Firestore error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [uid]);

    // Firestore only changes when the API succeeds, so after midnight in Bangkok
    // the stored counters are still yesterday's until the next successful call —
    // and while the API is failing, they never change at all. Applying the same
    // day rule the server uses lets the badge roll over on the clock instead.
    // The limits are read as stored either way: a reset zeroes counters only.
    const isCurrentDay = isQuotaDayCurrent(quota);

    const used = isCurrentDay ? (quota?.tokens_today || 0) : 0;
    // `??`, not `||`: a limit of 0 is how a user is suspended, and it is exactly
    // the value `||` would swap back for the full default.
    const limit = quota?.daily_limit ?? 10000;
    const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 100;
    const isNearLimit = percentage >= 90;
    const isOverLimit = used >= limit;

    const liveSecondsUsed = isCurrentDay ? (quota?.live_seconds_today || 0) : 0;
    const liveSecondsLimit = quota?.live_seconds_limit ?? 600;
    const livePercentage = liveSecondsLimit > 0
        ? Math.min((liveSecondsUsed / liveSecondsLimit) * 100, 100)
        : 100;
    const isLiveOverLimit = liveSecondsUsed >= liveSecondsLimit;

    return {
        quota,
        loading,
        used,
        limit,
        percentage,
        isNearLimit,
        isOverLimit,
        liveSecondsUsed,
        liveSecondsLimit,
        livePercentage,
        isLiveOverLimit,
        uid
    };
};

export default useQuota;
