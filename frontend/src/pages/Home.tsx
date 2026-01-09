import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card/Card';
import { Plus } from 'lucide-react';

export const Home: React.FC = () => {
  const { cards, fetchCards, fetchTasks, addCard, updateCard, deleteCard } = useStore();

  useEffect(() => {
    fetchCards();
    fetchTasks();
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
        
        {/* Waterfall Layout */}
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
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
        </div>
      </div>

      {/* Floating Add Button */}
      <button 
        onClick={handleAddCard}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-50"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};