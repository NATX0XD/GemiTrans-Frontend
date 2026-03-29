import React from 'react';
import HistoryContainer from '../components/History/HistoryContainer';
import PageBackground from '../components/Main/Layout/PageBackground';

const HistoryPage = () => {
  return (
    <PageBackground type="history">
      <div className="w-full flex-1 flex flex-col relative h-[calc(100vh-80px)] overflow-y-auto">
        <div className="w-full px-4 lg:px-8 py-10 lg:py-12">
          
          {/* Header Section */}
          <div className="max-w-7xl mx-auto mb-10 text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight flex items-center justify-center lg:justify-start gap-4">
              Translation History
            </h1>
            <p className="text-slate-500 mt-3 font-medium text-sm lg:text-base max-w-xl mx-auto lg:mx-0">
              Review your most recent translations. We save your last 100 translations automatically to keep things fast and clean.
            </p>
          </div>

          {/* Content Section */}
          <div className="max-w-7xl mx-auto w-full">
            <HistoryContainer />
          </div>
          
        </div>
      </div>
    </PageBackground>
  );
};

export default HistoryPage;
