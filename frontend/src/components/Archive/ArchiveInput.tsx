import React, { useState } from 'react';
import { Archive } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const ArchiveInput: React.FC = () => {
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const { createArchive } = useStore();

  const handleArchive = async () => {
    if (!month || month.length !== 6) {
      alert('Please enter a valid month (YYYYMM)');
      return;
    }
    
    setLoading(true);
    try {
      await createArchive(month);
      setMonth('');
      alert('Archived successfully!');
    } catch (error: any) {
      alert('Failed to archive: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
      <div className="flex-1">
        <label htmlFor="archive-month" className="block text-sm font-medium text-gray-700 mb-1">
          Archive Month
        </label>
        <input
          id="archive-month"
          type="text"
          placeholder="YYYYMM (e.g. 202310)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>
      <button
        onClick={handleArchive}
        disabled={loading}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-2.5 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Archive className="w-4 h-4" />
        {loading ? 'Archiving...' : 'Archive'}
      </button>
    </div>
  );
};
