const settings = {
    en: {
        settings: {
            title: 'Settings',
            subtitle: 'Personalize your app',
            tabs: {
                languages: 'Languages',
                voice: 'Voice & Audio',
                appearance: 'Appearance',
            },
            descriptions: {
                languages: 'Quick-access translation menu preferences.',
                voice: 'Control how the AI speaks your translations.',
                appearance: 'Customize the look and feel of the application.',
            },
            savedSuccess: 'Successfully Saved',
            syncing: 'Syncing...',
            apply: 'Apply',
            close: 'Close',
            discard: {
                title: 'Discard Changes?',
                message: 'You have unsaved changes. If you leave now, your adjustments will be lost and the app will not update.',
                confirm: 'Discard Anyway',
                cancel: 'Stay Here',
            },
            appearance: {
                themeColor: 'App Theme Color',
                currentlyUsing: 'Currently using: {mode} Mode',
                light: 'Light',
                dark: 'Dark',
            },
            voice: {
                speedLabel: 'Reading Speed',
                speedHint: 'Adjust the narration playback rate',
                pitchLabel: 'Voice Pitch',
                pitchHint: 'Change the frequency of the voice',
            },
            languages: {
                noDefaults: 'No defaults selected (Max 3)',
                searchPlaceholder: 'Search to filter languages...',
                noMatch: 'No languages match your search',
                limitReached: 'Select limit reached (3/3)',
            },
            confirm: {
                title: 'Confirm Deletion',
                message: 'Are you sure you want to delete this? This action cannot be undone.',
                confirm: 'Delete',
                cancel: 'Cancel',
            },
        },
    },
    th: {
        settings: {
            title: 'การตั้งค่า',
            subtitle: 'ปรับแต่งแอปของคุณ',
            tabs: {
                languages: 'ภาษา',
                voice: 'เสียงและระบบเสียง',
                appearance: 'รูปลักษณ์',
            },
            descriptions: {
                languages: 'ตั้งค่าเมนูภาษาแปลสำหรับการเข้าถึงอย่างรวดเร็ว',
                voice: 'ควบคุมวิธีที่ AI อ่านคำแปลของคุณ',
                appearance: 'ปรับแต่งรูปลักษณ์และการแสดงผลของแอปพลิเคชัน',
            },
            savedSuccess: 'บันทึกสำเร็จแล้ว',
            syncing: 'กำลังซิงค์...',
            apply: 'ปรับใช้',
            close: 'ปิด',
            discard: {
                title: 'ยกเลิกการเปลี่ยนแปลง?',
                message: 'คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก หากออกตอนนี้ การปรับแต่งของคุณจะหายไปและแอปจะไม่อัปเดต',
                confirm: 'ยกเลิกต่อไป',
                cancel: 'อยู่ต่อ',
            },
            appearance: {
                themeColor: 'สีธีมของแอป',
                currentlyUsing: 'กำลังใช้งาน: โหมด{mode}',
                light: 'สว่าง',
                dark: 'มืด',
            },
            voice: {
                speedLabel: 'ความเร็วในการอ่าน',
                speedHint: 'ปรับอัตราการเล่นเสียงบรรยาย',
                pitchLabel: 'ระดับเสียง',
                pitchHint: 'เปลี่ยนความถี่ของเสียง',
            },
            languages: {
                noDefaults: 'ยังไม่ได้เลือกค่าเริ่มต้น (สูงสุด 3)',
                searchPlaceholder: 'ค้นหาเพื่อกรองภาษา...',
                noMatch: 'ไม่มีภาษาที่ตรงกับการค้นหา',
                limitReached: 'เลือกครบตามจำนวนสูงสุดแล้ว (3/3)',
            },
            confirm: {
                title: 'ยืนยันการลบ',
                message: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้',
                confirm: 'ลบ',
                cancel: 'ยกเลิก',
            },
        },
    },
};

export default settings;
