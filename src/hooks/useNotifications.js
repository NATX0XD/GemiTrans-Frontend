import { useState, useEffect, useMemo } from 'react';
import useQuota from './useQuota';
import { fetchNotes } from '../services/notesService';
import { useTranslation } from '../context/LanguageContext';

const NOTIFICATION_THRESHOLDS = {
    LOW_TOKENS: 0.8, 
    CRITICAL_TOKENS: 0.95, 
    OLD_NOTE_DAYS: 14 
};

const useNotifications = () => {
    const { used, limit, percentage, isOverLimit, loading: quotaLoading, uid } = useQuota();
    const { t } = useTranslation();
    const [notes, setNotes] = useState([]);
    const [notesLoading, setNotesLoading] = useState(true);

    useEffect(() => {
        const loadNotes = async () => {
            if (uid) {
                try {
                    const data = await fetchNotes(uid);
                    setNotes(data || []);
                } catch (error) {
                    console.error("useNotifications: Error fetching notes", error);
                }
            }
            setNotesLoading(false);
        };
        loadNotes();
    }, [uid]);

    const notifications = useMemo(() => {
        if (quotaLoading || notesLoading || !uid) return [];

        const list = [];

        
        if (isOverLimit) {
            list.push({
                id: 'quota-limit',
                type: 'danger',
                title: t('notif.quotaLimit.title'),
                message: t('notif.quotaLimit.message'),
                date: t('notif.time.now'),
                icon: 'ZapOff'
            });
        } else if (percentage >= (NOTIFICATION_THRESHOLDS.LOW_TOKENS * 100)) {
            const isCritical = percentage >= (NOTIFICATION_THRESHOLDS.CRITICAL_TOKENS * 100);
            list.push({
                id: 'quota-low',
                type: isCritical ? 'danger' : 'warning',
                title: isCritical ? t('notif.quotaCritical.title') : t('notif.quotaLow.title'),
                message: t('notif.quotaUsage', {
                    percent: Math.round(percentage),
                    used: used.toLocaleString(),
                    limit: limit.toLocaleString(),
                }),
                date: t('notif.time.recently'),
                icon: 'Zap'
            });
        }

        
        const now = Date.now();
        const oldNoteThreshold = NOTIFICATION_THRESHOLDS.OLD_NOTE_DAYS * 24 * 60 * 60 * 1000;
        
        const oldNotes = notes.filter(note => {
            const createDate = note.createdAt || (note.updatedAt ? note.updatedAt : null);
            
            const dateVal = createDate?.seconds ? createDate.seconds * 1000 : createDate;
            return dateVal && (now - dateVal) > oldNoteThreshold;
        });

        if (oldNotes.length > 0) {
            
            const oldest = oldNotes.sort((a, b) => {
                const da = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt;
                const db = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt;
                return (da || 0) - (db || 0);
            })[0];

            list.push({
                id: 'old-note-reminder',
                type: 'info',
                title: t('notif.reviewNotes.title'),
                message: t('notif.reviewNotes.message', {
                    title: oldest.title || t('notif.reviewNotes.untitled'),
                    days: NOTIFICATION_THRESHOLDS.OLD_NOTE_DAYS,
                }),
                date: t('notif.time.recommendation'),
                icon: 'BookOpen',
                link: '/notes'
            });
        }

        return list;
    }, [quotaLoading, notesLoading, uid, isOverLimit, percentage, used, limit, notes, t]);

    return {
        notifications,
        hasUnread: notifications.length > 0,
        loading: quotaLoading || notesLoading
    };
};

export default useNotifications;
