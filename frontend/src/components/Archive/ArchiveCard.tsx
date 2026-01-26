import React, { useState } from 'react';
import { Archive as IArchive } from '../../types';
import { useStore } from '../../store/useStore';
import { ArchiveRestore, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface ArchiveCardProps {
  archive: IArchive;
}

export const ArchiveCard: React.FC<ArchiveCardProps> = ({ archive }) => {
  const { unarchive } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(archive.aggregatedReflection);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUnarchive = async () => {
    if (window.confirm('Are you sure you want to unarchive this month? The large card will disappear and individual cards will return to the list.')) {
      await unarchive(archive._id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {archive.month.substring(0, 4)} / {archive.month.substring(4, 6)} Archive
          </h2>
          <p className="text-gray-500 mt-1">
            Created on {new Date(archive.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleUnarchive}
          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
          title="Unarchive"
        >
          <ArchiveRestore className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="text-blue-600 text-sm font-medium mb-1">Total Tasks</div>
          <div className="text-2xl font-bold text-gray-900">{archive.stats.totalTasks}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl">
          <div className="text-green-600 text-sm font-medium mb-1">Completed</div>
          <div className="text-2xl font-bold text-gray-900">{archive.stats.completedTasks}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl">
          <div className="text-purple-600 text-sm font-medium mb-1">Completion Rate</div>
          <div className="text-2xl font-bold text-gray-900">{archive.stats.completionRate}%</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl">
          <div className="text-orange-600 text-sm font-medium mb-1">Total Time</div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.floor(archive.stats.totalTimeMinutes / 60)}h {archive.stats.totalTimeMinutes % 60}m
          </div>
        </div>
      </div>

      {/* Task Stats Table */}
      {archive.taskStats && archive.taskStats.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Common Task Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count (Done/Total)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {archive.taskStats.map((stat) => (
                  <tr key={stat.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.completedCount} / {stat.totalCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.round((stat.completedCount / stat.totalCount) * 100)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor(stat.totalTimeMinutes / 60)}h {stat.totalTimeMinutes % 60}m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Monthly Reflections</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        <div 
          className={`relative overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-[5000px]' : 'max-h-32'
          }`}
        >
          <pre className="whitespace-pre-wrap text-gray-600 font-sans text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            {archive.aggregatedReflection || 'No reflections recorded for this month.'}
          </pre>
          
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>
      </div>
    </div>
  );
};
