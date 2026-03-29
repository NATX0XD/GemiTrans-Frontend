import React from 'react';
import { Textarea, Button } from '@heroui/react';
import { Sparkles, Languages } from 'lucide-react';

const SourceCard = ({ sourceText, detectedLang, onSourceTextChange, onTranslate, isTranslating, isDisabled }) => {
  return (
    <div className="w-full lg:h-full min-h-[220px] lg:min-h-0 flex flex-col bg-white/95 backdrop-blur-3xl rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.06),0_0_40px_rgba(99,102,241,0.15)] ring-1 ring-white border-[1.5px] border-indigo-100/60 overflow-hidden relative group transition-all hover:shadow-[0_12px_50px_rgba(0,0,0,0.08),0_0_60px_rgba(99,102,241,0.25)] hover:border-indigo-300">

      {/* Decorative Glow inside SourceCard */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/15 blur-[80px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 ring-1 ring-indigo-500/10 transition-colors px-4 py-2 h-9 rounded-xl border-0">
            <Languages size={15} className="text-indigo-600 shrink-0" />
            <span className="font-bold text-xs text-indigo-700 uppercase tracking-widest">{detectedLang ? " Translate from " + detectedLang : "Detect Language"}</span>
          </div>

          <Button
            color="primary"
            className="h-9 px-6 font-bold text-xs tracking-wide rounded-xl bg-indigo-600 shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:bg-indigo-700 transition-all border-none text-white disable-bg-white group/btn"
            isLoading={isTranslating}
            onPress={onTranslate}
            isDisabled={isDisabled}
            startContent={!isTranslating && <Sparkles className="group-hover/btn:rotate-12 transition-transform opacity-90" size={14} />}
          >
            {isTranslating ? 'Translating' : 'Translate'}
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 px-8 pt-4 pb-6 flex flex-col min-h-0 overflow-hidden z-10">
          <Textarea
            variant="light"
            placeholder="Type what you'd like to translate..."
            classNames={{
              base: "w-full h-full flex-1 min-h-0",
              input: "resize-none text-xl font-medium text-slate-800 leading-relaxed placeholder:text-slate-300 h-full overflow-y-auto mix-blend-multiply",
              inputWrapper: "h-full bg-transparent shadow-none hover:bg-transparent focus-within:!bg-transparent data-[hover=true]:bg-transparent data-[focus=true]:!bg-transparent data-[focus=true]:!shadow-none data-[focus=true]:!ring-0 data-[focus-visible=true]:!ring-0 px-0"
            }}
            value={sourceText}
            onValueChange={onSourceTextChange}
            minRows={6}
          />
        </div>
      </div>
    </div>
  );
};

export default SourceCard;
