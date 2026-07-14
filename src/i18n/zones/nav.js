const nav = {
    en: {
        nav: {
            translate: 'Translate',
            notebook: 'Notebook',
            savedWords: 'Saved Words',
            history: 'History',
            menu: 'Menu',
        },
        profile: {
            settings: 'Settings',
            upgradePlan: 'Upgrade Plan',
            signOut: 'Sign out',
            user: 'User',
            language: 'Language',
            notifications: 'Notifications',
        },
        notif: {
            title: 'Notifications',
            takeAction: 'Take action',
            emptyTitle: 'All caught up!',
            emptyHint: 'No new alerts for your account right now.',
            time: {
                now: 'Now',
                recently: 'Recently',
                recommendation: 'Recommendation',
            },
            quotaLimit: {
                title: 'Daily Limit Reached',
                message: 'You have used up your direct translation quota for today.',
            },
            quotaCritical: { title: 'Critical Token Usage' },
            quotaLow: { title: 'Running Low on Tokens' },
            quotaUsage: 'You have used {percent}% of your daily limit ({used} / {limit}).',
            reviewNotes: {
                title: 'Review Your Notes',
                message: 'You created "{title}" over {days} days ago. Need a refresher?',
                untitled: 'Untitled note',
            },
        },
    },
    th: {
        nav: {
            translate: 'แปลภาษา',
            notebook: 'สมุดโน้ต',
            savedWords: 'คำที่บันทึก',
            history: 'ประวัติ',
            menu: 'เมนู',
        },
        profile: {
            settings: 'ตั้งค่า',
            upgradePlan: 'อัปเกรดแพ็กเกจ',
            signOut: 'ออกจากระบบ',
            user: 'ผู้ใช้',
            language: 'ภาษา',
            notifications: 'การแจ้งเตือน',
        },
        notif: {
            title: 'การแจ้งเตือน',
            takeAction: 'ดำเนินการ',
            emptyTitle: 'ไม่มีรายการค้าง',
            emptyHint: 'ตอนนี้ยังไม่มีการแจ้งเตือนใหม่สำหรับบัญชีของคุณ',
            time: {
                now: 'ตอนนี้',
                recently: 'เมื่อสักครู่',
                recommendation: 'คำแนะนำ',
            },
            quotaLimit: {
                title: 'ใช้โควตาครบแล้ววันนี้',
                message: 'คุณใช้โควตาการแปลโดยตรงของวันนี้หมดแล้ว',
            },
            quotaCritical: { title: 'การใช้โทเคนใกล้เต็ม' },
            quotaLow: { title: 'โทเคนใกล้หมด' },
            quotaUsage: 'คุณใช้ไปแล้ว {percent}% ของโควตารายวัน ({used} / {limit})',
            reviewNotes: {
                title: 'ทบทวนโน้ตของคุณ',
                message: 'คุณสร้าง "{title}" เมื่อกว่า {days} วันก่อน อยากทบทวนไหม?',
                untitled: 'โน้ตไม่มีชื่อ',
            },
        },
    },
};

export default nav;
