import React, { useState } from 'react';
import { Slider, Button } from '@heroui/react';
import { SlidersHorizontal, Bookmark, BookmarkCheck, Copy, Check, Volume2 } from 'lucide-react';
import { auth } from '../../../configuration/firebase';
import { addSavedWord } from '../../../services/savedWordsService';
import { speakText } from '../../../services/speechService';

const FooterCard = ({ formality, onFormalityChange, sourceText, sourceLang, targetLang, objective, resultText }) => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const getFormalityLabel = (val) => {
    if (val <= 30) return `${val}% · Casual`;
    if (val <= 70) return `${val}% · Standard`;
    return `${val}% · Formal`;
  };

  const handleSaveWord = async () => {
    if (!auth.currentUser || !resultText || isSaved || isSaving) return;
    setIsSaving(true);
    try {
      await addSavedWord(auth.currentUser.uid, {
        sourceText: sourceText || '',
        sourceLang: sourceLang || 'Auto',
        translatedText: resultText,
        targetLang: targetLang || '',
        objective: objective || 'general',
        formality: formality ?? 50,
      });
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to save word", error);
    }
    setIsSaving(false);
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!resultText) return;
    speakText(resultText, targetLang);
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center gap-4 z-20 transition-all duration-500 group-hover:bg-white/80 dark:group-hover:bg-slate-900/80">

      {/* Slider Area */}
      <div className="flex-1 flex items-center gap-2 px-2 overflow-hidden">
        <button
          onClick={() => setIsSliderOpen(!isSliderOpen)}
          className="flex items-center justify-center gap-1.5 p-1.5 pr-2.5 -ml-1.5 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-800/80 active:scale-95 transition-all border-0 cursor-pointer outline-none group/icon bg-transparent"
        >
          <SlidersHorizontal size={15} className={`${isSliderOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-500'} transition-colors pl-0.5`} />
          <span className={`text-[10px] font-bold tracking-wider uppercase ${isSliderOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-500'} transition-colors`}>Tone</span>
        </button>

        <div
          className={`flex items-center overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] ${isSliderOpen ? 'opacity-100 max-w-[200px] flex-1 px-3' : 'opacity-0 max-w-0 px-0'
            }`}
        >
          <Slider
            size="sm"
            step={5}
            color="foreground"
            showSteps={false}
            maxValue={100}
            minValue={0}
            value={formality}
            onChange={(val) => onFormalityChange(val)}
            className="w-full min-w-[80px]"
            classNames={{
              base: "gap-1",
              track: "h-1.5 bg-purple-200/80 dark:bg-slate-800",
              filler: "bg-slate-800 dark:bg-indigo-500",
              thumb: "bg-purple-500 dark:bg-indigo-400 shadow-md dark:shadow-[0_0_10px_rgba(99,102,241,0.4)]"
            }}
            aria-label="Tone Format"
          />
        </div>

        <div
          className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer whitespace-nowrap select-none hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          onClick={() => setIsSliderOpen(!isSliderOpen)}
        >
          {getFormalityLabel(formality)}
        </div>
      </div>

      <div className="w-px h-6 bg-slate-200/60 dark:bg-slate-800 shrink-0"></div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0 pr-1">
        <Button
          isIconOnly size="sm" variant="light"
          className={`rounded-full transition-colors w-8 h-8 min-w-8 ${isSaved
            ? 'text-amber-500 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20'
            : 'text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            }`}
          onPress={handleSaveWord}
          isDisabled={isSaving || !resultText}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </Button>
        <Button
          isIconOnly size="sm" variant="light"
          className="rounded-full transition-colors w-8 h-8 min-w-8 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
          onPress={handleSpeak}
          isDisabled={!resultText}
          title="Listen"
        >
          <Volume2 size={16} />
        </Button>
        <Button
          isIconOnly size="sm" variant="light"
          className={`rounded-full transition-colors w-8 h-8 min-w-8 ${isCopied
            ? 'text-emerald-500 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
            : 'text-slate-400 dark:text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
            }`}
          onPress={handleCopy}
          isDisabled={!resultText}
        >
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
        </Button>
      </div>

    </div>
  );
};

export default FooterCard;