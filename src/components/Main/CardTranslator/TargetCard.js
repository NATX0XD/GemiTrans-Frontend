import React from 'react';
import HeadCard from './HeadCard';
import ContentCard from './ContentCard';
import FooterCard from './FooterCard';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TargetCard = ({ card, sourceText, detectedLang, onUpdateCard, onRemoveCard, canRemove, onOpenLangModal }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`w-full lg:h-full min-h-[220px] lg:min-h-0 flex flex-col bg-slate-50/60 backdrop-blur-3xl rounded-[32px] shadow-sm border border-slate-200/60 overflow-hidden relative group transition-all hover:shadow-lg hover:border-slate-300 ${isDragging ? 'cursor-grabbing shadow-2xl ring-2 ring-indigo-500/20' : ''}`}
    >
      
      {/* Decorative Glow inside TargetCard */}
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-400/20 blur-[80px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-pink-400/20 blur-[80px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col h-full min-h-0">
        <HeadCard 
          card={card} 
          onUpdateCard={onUpdateCard} 
          onRemoveCard={onRemoveCard} 
          canRemove={canRemove} 
          onOpenLangModal={onOpenLangModal}
          dragHandleProps={{ ...attributes, ...listeners }}
        />
        <ContentCard 
          loading={card.loading}
          resultText={card.resultText}
        />
        <FooterCard 
          formality={card.formality}
          onFormalityChange={(val) => onUpdateCard(card.id, 'formality', val)}
          sourceText={sourceText}
          sourceLang={detectedLang}
          targetLang={card.lang}
          objective={card.objective}
          resultText={card.resultText}
        />
      </div>
    </div>
  );
};

export default TargetCard;
