import React from 'react';
import { 
  Search, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  ArrowDownWideNarrow, 
  ArrowUpNarrowWide,
  Clock
} from 'lucide-react';
import { 
  Input, 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem
} from '@heroui/react';

const ContentFilter = ({ 
  title,
  description,
  viewMode, 
  setViewMode, 
  sortBy, 
  setSortBy, 
  searchQuery, 
  setSearchQuery, 
  showSearch = false,
  totalItems = 0,
  label = "Items",
  color = "indigo" // Default color
}) => {
  // Color mapping for dynamic styles
  const colorMap = {
    indigo: {
      text: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      badgeText: "text-indigo-500",
      icon: "text-indigo-500"
    },
    amber: {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      badgeText: "text-amber-600",
      icon: "text-amber-500"
    },
    emerald: {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      badgeText: "text-emerald-600",
      icon: "text-emerald-500"
    }
  };

  const theme = colorMap[color] || colorMap.indigo;

  return (
    <div className="flex flex-col gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* Top Row: Title & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left: Title Area */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-4">
            {title}
            <span className={`text-[11px] font-black ${theme.bg} ${theme.badgeText} px-3 py-1 rounded-full uppercase tracking-widest align-middle mt-1 hidden sm:inline-block`}>
              {totalItems} {label}
            </span>
          </h1>
          {description && (
            <p className="text-slate-500 dark:text-slate-500 font-medium text-sm lg:text-base max-w-xl">
              {description}
            </p>
          )}
        </div>

        {/* Right: Primary Controls */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          
          {/* View Switcher (Grouped) */}
          <div className="flex items-center gap-3 mr-2 p-1 bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-full shadow-sm">
            <Button
              isIconOnly
              variant={viewMode === 'grid' ? 'flat' : 'light'}
              radius="full"
              className={`h-9 w-9 min-w-[36px] transition-all ${viewMode === 'grid' ? `${theme.bg} ${theme.text}` : 'text-slate-400 dark:text-slate-500'}`}
              onPress={() => setViewMode('grid')}
            >
              <LayoutGrid size={18} strokeWidth={viewMode === 'grid' ? 2.5 : 2} />
            </Button>
            <Button
              isIconOnly
              variant={viewMode === 'table' ? 'flat' : 'light'}
              radius="full"
              className={`h-9 w-9 min-w-[36px] transition-all ${viewMode === 'table' ? `${theme.bg} ${theme.text}` : 'text-slate-400 dark:text-slate-500'}`}
              onPress={() => setViewMode('table')}
            >
              <List size={20} strokeWidth={viewMode === 'table' ? 2.5 : 2} />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <Dropdown 
            classNames={{
              content: "bg-white/95 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 backdrop-blur-xl rounded-2xl shadow-2xl p-1",
            }}
          >
            <DropdownTrigger>
              <Button 
                variant="flat" 
                radius="full"
                className="h-11 px-5 bg-white dark:bg-slate-900/60 font-bold border border-slate-200/60 dark:border-slate-800 shadow-sm transition-colors"
                startContent={sortBy === 'latest' ? <ArrowDownWideNarrow size={18} className={theme.icon} /> : <ArrowUpNarrowWide size={18} className={theme.icon} />}
                endContent={<ChevronDown size={14} className="opacity-40" />}
              >
                {sortBy === 'latest' ? 'Latest' : 'Oldest'}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Sort options"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={new Set([sortBy])}
              onAction={(key) => setSortBy(key)} // Changed to onAction for better reliability
              variant="flat"
            >
              <DropdownItem 
                key="latest" 
                startContent={<Clock size={16} />}
                className="font-bold py-2.5 rounded-xl"
              >
                Latest First
              </DropdownItem>
              <DropdownItem 
                key="oldest" 
                startContent={<ArrowUpNarrowWide size={16} />}
                className="font-bold py-2.5 rounded-xl"
              >
                Oldest First
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Bottom Row: Search */}
      {showSearch && (
        <div className="w-full lg:w-96 animate-in fade-in slide-in-from-left-2 duration-700 delay-100">
          <Input
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder="Search within these records..."
            startContent={<Search size={18} className="text-slate-400" />}
            variant="flat"
            radius="2xl"
            classNames={{
              input: "text-sm font-medium",
              inputWrapper: "h-12 bg-white dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/50 shadow-sm focus-within:ring-2 ring-indigo-500/20"
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ContentFilter;
