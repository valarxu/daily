import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card/Card';
import { ArchiveInput } from '../components/Archive/ArchiveInput';
import { ArchiveCard } from '../components/Archive/ArchiveCard';
import { Plus, ChevronLeft, ChevronRight, Layout, Archive } from 'lucide-react';

export const Home: React.FC = () => {
  const { cards, archives, fetchCards, fetchTasks, fetchArchives, addCard, updateCard, deleteCard, currentPage, totalPages } = useStore();
  const [activeTab, setActiveTab] = useState<'daily' | 'archive'>('daily');

  useEffect(() => {
    fetchCards(1);
    fetchTasks();
    fetchArchives();
  }, []);

  const handleAddCard = async () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    await addCard({
        date: today,
        tasks: [],
        isCompleted: false,
        reflection: ''
    });
  };

  const handleUpdateCard = async (id: string, updatedData: any) => {
    if (!id) return;
    await updateCard(id, updatedData);
  };

  return (
    <div className="min-h-screen bg-white p-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Time Blocking & Reflection</h1>
            <p className="text-gray-500 mt-1">Plan your day in 30-minute blocks</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'daily'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Layout className="w-4 h-4" />
              Daily View
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'archive'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Archive className="w-4 h-4" />
              Archives
            </button>
          </div>
        </div>
        
        {/* Waterfall Layout */}
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {activeTab === 'archive' ? (
              <>
                <ArchiveInput />
                {/* Archived Cards */}
                {archives.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Archive className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No archives found. Enter a month to archive.</p>
                  </div>
                ) : (
                  archives.map(archive => (
                    <ArchiveCard key={archive._id} archive={archive} />
                  ))
                )}
              </>
            ) : (
              <>
                {/* Sort cards: Incomplete first, then by date desc */}
                {cards
                    .sort((a, b) => {
                        if (a.isCompleted === b.isCompleted) {
                            return b.date.localeCompare(a.date);
                        }
                        return a.isCompleted ? 1 : -1;
                    })
                    .map(card => (
                    <div key={card._id} className="w-full">
                        <Card 
                            data={card} 
                            onUpdate={(newData) => handleUpdateCard(card._id!, newData)}
                            onDelete={() => card._id && deleteCard(card._id)}
                        />
                    </div>
                ))}
                
                {cards.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Layout className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No daily cards found. Create one to get started.</p>
                  </div>
                )}
              </>
            )}
        </div>

        {/* Pagination Controls - Only show in Daily View */}
        {activeTab === 'daily' && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 pb-20">
                <button 
                    onClick={() => fetchCards(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <button 
                    onClick={() => fetchCards(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
            </div>
        )}
      </div>

      {/* Floating Add Button - Only show in Daily View */}
      {activeTab === 'daily' && (
        <button 
          onClick={handleAddCard}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-50"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
