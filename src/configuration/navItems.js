import { Languages, BookOpen, Bookmark, History } from 'lucide-react'

// `labelKey` resolves through i18n (t(labelKey)); `name` kept as a stable React key/fallback.
export const navItems = [
    { name: 'Translate', labelKey: 'nav.translate', path: '/app', icon: <Languages className="w-[18px] h-[18px]" strokeWidth={2} /> },
    { name: 'Notebook', labelKey: 'nav.notebook', path: '/notes', icon: <BookOpen className="w-[18px] h-[18px]" strokeWidth={2} /> },
    { name: 'Saved Words', labelKey: 'nav.savedWords', path: '/saved', icon: <Bookmark className="w-[18px] h-[18px]" strokeWidth={2} /> },
    { name: 'History', labelKey: 'nav.history', path: '/history', icon: <History className="w-[18px] h-[18px]" strokeWidth={2} /> },
]