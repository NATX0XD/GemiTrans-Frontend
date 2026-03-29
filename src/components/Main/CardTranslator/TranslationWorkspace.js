import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Plus } from 'lucide-react';
import SourceCard from './SourceCard';
import TargetCard from './TargetCard';
import { translateTextAPI } from '../../../context/ControllerApi';
import { auth } from '../../../configuration/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { appendTranslationHistory } from '../../../services/historyService';
import { getUserSettings } from '../../../services/settingsService';

// DND Kit Imports
import {
  DndContext, 
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

const TranslationWorkspace = forwardRef(({ onOpenLanguageModal }, ref) => {
  const [sourceText, setSourceText] = useState('');
  const [detectedLang, setDetectedLang] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [targetCards, setTargetCards] = useState([
    {
      id: "card-initial",
      lang: 'English',
      objective: 'general',
      formality: 50,
      loading: false,
      resultText: ''
    }
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const settings = await getUserSettings(user.uid);
        if (settings && settings.defaultLanguages && settings.defaultLanguages.length > 0) {
          const newCards = settings.defaultLanguages.map((lang, index) => ({
            id: `card-${Date.now()}-${index}`,
            lang: lang,
            objective: 'general',
            formality: 50,
            loading: false,
            resultText: ''
          }));
          setTargetCards(newCards);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid accidental drags when clicking
      },
    })
  );

  // Handle Drag End
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setTargetCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Expose current translation data to parent via ref
  useImperativeHandle(ref, () => ({
    getNoteData: () => {
      return {
        sourceText,
        translations: targetCards
          .filter(c => c.resultText)
          .map(c => ({ text: c.resultText, lang: c.lang })),
      };
    }
  }));

  const handleOpenLangModal = (cardId) => {
    const card = targetCards.find(c => c.id === cardId);
    if (!card) return;

    onOpenLanguageModal(cardId, card.lang, (id, lang) => {
      handleUpdateCard(id, 'lang', lang);
    });
  };

  const MAX_CARDS = 3;

  const handleAddCard = () => {
    if (targetCards.length >= MAX_CARDS) return;
    
    onOpenLanguageModal('NEW_CARD', '', (id, selectedLang) => {
      setTargetCards(currentCards => [
        ...currentCards,
        {
          id: `card-${Date.now()}`,
          lang: selectedLang,
          objective: 'general',
          formality: 50,
          loading: false,
          resultText: ''
        }
      ]);
    });
  };

  const handleRemoveCard = (id) => {
    setTargetCards(targetCards.filter(card => card.id !== id));
  };

  const handleUpdateCard = (id, field, value) => {
    setTargetCards(targetCards.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  const handleTranslateAll = async () => {
    if (!sourceText.trim()) return;
    
    setIsTranslating(true);
    setTargetCards(cards => cards.map(c => ({ ...c, loading: true, resultText: '' })));

    const targetsConfig = targetCards.map(c => ({
      lang: c.lang,
      formality: c.formality,
      objective: c.objective
    }));

    const payload = {
      sourceText: sourceText,
      targets: targetsConfig
    };

    try {
      const res = await translateTextAPI(payload);
      const translationsArray = res.translations || [];

      setTargetCards(cards => cards.map((card, index) => {
        const match = translationsArray[index];
        return {
          ...card,
          resultText: match ? match.text : '⚠️ No translation returned for this card.',
          loading: false
        };
      }));

      if (res.detected) {
        setDetectedLang(res.detected);
      }

      if (auth.currentUser && translationsArray.length > 0) {
        const historyItemsToSave = targetCards.map((c, i) => ({
          sourceText: sourceText,
          sourceLang: res.detected || 'Auto',
          translatedText: translationsArray[i]?.text || '',
          targetLang: c.lang,
          objective: c.objective,
          formality: c.formality
        })).filter(item => item.translatedText);

        if (historyItemsToSave.length > 0) {
          appendTranslationHistory(auth.currentUser.uid, historyItemsToSave)
            .catch(e => console.error('Failed to remotely save history', e));
        }
      }
    } catch (err) {
      console.error('Translation error:', err);
      setTargetCards(cards => cards.map(c => ({
        ...c,
        resultText: '❌ Translation failed. Please try again.',
        loading: false
      })));
    }

    setIsTranslating(false);
  };

  return (
    <div className="w-full lg:h-full flex flex-col relative flex-1">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="w-full lg:h-full grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-4 p-4 auto-rows-auto">
          
          {/* Cell 1: Source (Always First, Not Sortable) */}
          <SourceCard 
            sourceText={sourceText} 
            detectedLang={detectedLang}
            onSourceTextChange={(val) => {
              setSourceText(val);
              setDetectedLang(null);
            }}
            onTranslate={handleTranslateAll}
            isTranslating={isTranslating}
            isDisabled={!sourceText.trim()}
          />

          {/* Cells 2-3+: Target Cards (Sortable) */}
          <SortableContext 
            items={targetCards.map(c => c.id)}
            strategy={rectSortingStrategy}
          >
            {targetCards.map((card) => (
              <TargetCard 
                key={card.id} 
                card={card} 
                sourceText={sourceText}
                detectedLang={detectedLang}
                onUpdateCard={handleUpdateCard}
                onRemoveCard={handleRemoveCard}
                canRemove={targetCards.length > 1}
                onOpenLangModal={handleOpenLangModal}
              />
            ))}
          </SortableContext>

          {/* Cell: Add More Language Button Area */}
          {targetCards.length < MAX_CARDS && (
            <div 
              className={`w-full lg:h-full min-h-[140px] p-6 flex flex-col items-center justify-center border-2 border-dashed border-indigo-200/60 dark:border-slate-800 rounded-2xl bg-indigo-50/20 dark:bg-slate-900/40 hover:bg-indigo-50/50 dark:hover:bg-slate-800/60 hover:border-indigo-300/60 transition-all cursor-pointer text-indigo-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-slate-400 group ${targetCards.length === 1 ? 'lg:col-span-2' : ''}`}
              onClick={handleAddCard}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100/60 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <span className="text-sm font-bold tracking-wide text-indigo-500 dark:text-slate-300">Add Another Translation</span>
              <span className="text-xs font-medium text-indigo-400/80 dark:text-slate-500 mt-1.5 max-w-sm text-center leading-relaxed">
                Compare different languages, tones, or contexts side-by-side in one click.
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-4 px-2 py-1 bg-indigo-100/60 dark:bg-slate-800 text-indigo-500/80 dark:text-slate-400 rounded-md">
                {targetCards.length} / {MAX_CARDS} Cards Used
              </span>
            </div>
          )}

        </div>
      </DndContext>
    </div>
  );
});

export default TranslationWorkspace;
