import { Languages, BookOpen, Bookmark, History } from 'lucide-react'

export const navItems = [
    { name: 'Translate', path: '/app', icon: <Languages className="w-[18px] h-[18px]" strokeWidth={2} /> },
    { name: 'Notebook', path: '/notes', icon: <BookOpen className="w-[18px] h-[18px]" strokeWidth={2} /> },
    { name: 'Saved Words', path: '/saved', icon: <Bookmark className="w-[18px] h-[18px]" strokeWidth={2} /> },
    { name: 'History', path: '/history', icon: <History className="w-[18px] h-[18px]" strokeWidth={2} /> },
]