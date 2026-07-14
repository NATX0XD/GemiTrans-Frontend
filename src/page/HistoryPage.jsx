import React from 'react';
import HistoryContainer from '../components/History/HistoryContainer';
import PageBackground from '../components/Main/Layout/PageBackground';
import { useTranslation } from '../context/LanguageContext';

const HistoryPage = () => {
  const { t } = useTranslation();
  return (
    <PageBackground type="history">
      <div className="w-full flex-1 flex flex-col relative h-[calc(100vh-80px)] overflow-y-auto">
        <div className="w-full px-4 lg:px-8 py-10 lg:py-12">
          
          <div className="max-w-7xl mx-auto w-full">
            <HistoryContainer
              title={t('history.pageTitle')}
              description={t('history.pageDescription')}
            />
          </div>
          
        </div>
      </div>
    </PageBackground>
  );
};

export default HistoryPage;
