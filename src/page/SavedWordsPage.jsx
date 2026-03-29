import React from 'react';
import SavedWordsContainer from '../components/SavedWords/SavedWordsContainer';
import PageBackground from '../components/Main/Layout/PageBackground';

const SavedWordsPage = () => {
  return (
    <PageBackground type="saved">
      <div className="w-full flex-1 flex flex-col relative h-[calc(100vh-80px)] overflow-y-auto">
        <div className="w-full px-4 lg:px-8 py-10 lg:py-12">
          
          <div className="max-w-7xl mx-auto w-full">
            <SavedWordsContainer 
              title="Saved Words"
              description="Your personal collection of bookmarked translations. Tap the bookmark icon on any translation to save it here."
            />
          </div>
          
        </div>
      </div>
    </PageBackground>
  );
};

export default SavedWordsPage;
