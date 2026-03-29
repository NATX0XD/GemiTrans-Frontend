import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Trash2, ChevronDown, GripVertical } from 'lucide-react';
import ConfirmModal from '../Modal/ConfirmModal';
import objectiveList from '../../../configuration/objectiveList';
import { availableLanguages } from '../../../configuration/availableLanguages';

const ContextDropdown = ({ selectedValue, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLabel = objectiveList.find(o => o.value === selectedValue)?.label || 'ทั่วไป';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-7 px-2 bg-transparent border-0 rounded-lg hover:bg-slate-300/30 dark:hover:bg-slate-800 transition-colors cursor-pointer outline-none -mr-2"
      >
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide">{selectedLabel}</span>
        <ChevronDown size={14} className="text-slate-500 dark:text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-3 right-0 min-w-[160px] bg-white rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-50 flex flex-col gap-1">
          {objectiveList.map((obj) => {
            const isSelected = selectedValue === obj.value;
            return (
              <button
                key={obj.value}
                onClick={() => {
                  onChange(obj.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all border-0 cursor-pointer outline-none ${isSelected
                  ? 'bg-blue-600 dark:bg-indigo-600 text-white shadow-md shadow-blue-500/30 dark:shadow-indigo-500/20'
                  : 'bg-transparent text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <span>{obj.label}</span>
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white ml-3 shrink-0"></div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  );
};

const HeadCard = ({ card, onUpdateCard, onRemoveCard, canRemove, onOpenLangModal, dragHandleProps }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const currentLanguageLabel = availableLanguages.find(l => l.value === card.lang)?.label || card.lang;

  const handleDeleteClick = () => {
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    onRemoveCard(card.id);
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-5 pb-2 bg-transparent shrink-0">

        {/* Left Side: Drag Handle & Language Box */}
        <div className="flex items-center gap-1">
          {/* Drag Handle */}
          <div 
            {...dragHandleProps}
            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 cursor-grab active:cursor-grabbing hover:bg-slate-200/40 dark:hover:bg-slate-800/40 rounded-lg transition-all"
            title="Drag to reorder"
          >
            <GripVertical size={20} />
          </div>

          <button
            type="button"
            onClick={() => onOpenLangModal(card.id)}
            className="h-9 px-4 bg-slate-200/50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-xl flex items-center gap-2 cursor-pointer border-0 outline-none ml-1 shadow-sm"
          >
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-500">Translate to</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentLanguageLabel}</span>
          </button>
        </div>

        {/* Right Side: Context & Delete */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-200/50 dark:bg-slate-800 rounded-xl px-4 h-9 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-500 mr-2 whitespace-nowrap">Style</span>
            <ContextDropdown
              selectedValue={card.objective}
              onChange={(val) => onUpdateCard(card.id, 'objective', val)}
            />
          </div>

          {/* Remove Button */}
          {canRemove && (
            <Button
              isIconOnly
              size="sm"
              variant="light"
              color="danger"
              className="shrink-0 w-8 h-8 min-w-8 rounded-full opacity-40 hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-red-500 bg-transparent"
              onPress={handleDeleteClick}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Translation Card"
        message={`Are you sure you want to remove the translation card for ${currentLanguageLabel}?`}
      />
    </>
  );
};

export default HeadCard;