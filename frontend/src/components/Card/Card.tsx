import React, { useState } from 'react';
import { Card as CardType, Task } from '../../types';
import { TimeGrid } from './TimeGrid';
import { useStore } from '../../store/useStore';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CardProps {
  data: CardType;
  onUpdate: (data: CardType) => void;
  onDelete?: () => void;
}

const COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', 
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E'
];

export const Card = ({ data, onUpdate, onDelete }: CardProps) => {
  const { tasks: availableTasks, addTask, deleteTask } = useStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // New Task State
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [isNewTaskCommon, setIsNewTaskCommon] = useState(false);

  // Filter tasks: Common tasks OR tasks belonging to this card
  const cardTasks = availableTasks.filter(t => t.isCommon || t.cardId === data._id);
  const selectedTask = cardTasks.find(t => t._id === selectedTaskId) || null;

  const handleCreateTask = async () => {
    if (!newTaskName.trim()) return;
    
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    await addTask({
        name: newTaskName,
        color: randomColor,
        isCommon: isNewTaskCommon,
        cardId: isNewTaskCommon ? undefined : data._id
    });
    
    setNewTaskName('');
    setIsNewTaskCommon(false);
    setIsAddingTask(false);
  };

  return (
    <div className={cn(
        "bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full flex flex-col gap-6 transition-all hover:shadow-lg",
        data.isCompleted && "ring-2 ring-green-500 ring-offset-2"
    )}>
      {/* Header: Date and Status */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
            <input 
                type="text" 
                value={data.date} 
                onChange={(e) => onUpdate({ ...data, date: e.target.value })}
                placeholder="YYYYMMDD"
                className="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none w-40 transition-colors"
            />
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => onUpdate({ ...data, isCompleted: !data.isCompleted })}
                className={cn(
                    "p-2 rounded-full transition-colors",
                    data.isCompleted ? "text-green-500 bg-green-50 hover:bg-green-100" : "text-gray-300 hover:text-green-500 hover:bg-gray-50"
                )}
                title={data.isCompleted ? "Mark as Incomplete" : "Mark as Completed"}
            >
                <Check className="w-5 h-5" />
            </button>
            {onDelete && (
                <button 
                    onClick={onDelete} 
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Card"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>

      {/* Task Palette */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-500">Task Palette</label>
        <div className="flex flex-wrap gap-2">
            {cardTasks.map(task => (
                <div key={task._id} className="relative group">
                    <button
                        onClick={() => setSelectedTaskId(task._id || null)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium text-white shadow-sm transition-all transform hover:scale-105 active:scale-95 border-2",
                            selectedTaskId === task._id ? "border-white/50 shadow-lg scale-105 ring-2 ring-blue-100" : "border-transparent opacity-90 hover:opacity-100"
                        )}
                        style={{ backgroundColor: task.color }}
                    >
                        {task.name}
                    </button>
                    {/* Delete Task Button - shows on hover */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (task._id && window.confirm('Delete this task?')) {
                                deleteTask(task._id);
                                if (selectedTaskId === task._id) setSelectedTaskId(null);
                            }
                        }}
                        className="absolute -top-1 -right-1 bg-white text-gray-400 hover:text-red-500 rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ))}
            
            {!isAddingTask ? (
                <button 
                    onClick={() => setIsAddingTask(true)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" /> New Task
                </button>
            ) : (
                <div className="flex flex-wrap items-center gap-2 w-full mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                    <input 
                        type="text" 
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        placeholder="Task name"
                        className="flex-1 min-w-[120px] text-sm bg-white px-3 py-1.5 rounded border border-gray-200 focus:border-blue-500 outline-none"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
                    />
                    
                    <div className="flex items-center gap-2 ml-auto">
                        <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none whitespace-nowrap">
                            <input 
                                type="checkbox" 
                                checked={isNewTaskCommon}
                                onChange={(e) => setIsNewTaskCommon(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Common?
                        </label>

                        <button onClick={handleCreateTask} className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsAddingTask(false)} className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Time Grid */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-500">24-Hour Schedule</label>
        <TimeGrid 
            tasks={data.tasks} 
            onUpdateTasks={(tasks) => onUpdate({ ...data, tasks })} 
            selectedTask={selectedTask}
        />
      </div>

      {/* Reflection */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-500">Daily Reflection</label>
        
        {/* Reflection Tasks/Checklist */}
        <div className="flex flex-col gap-2 mb-2">
             {data.tasks.map(task => {
                 // We need task name/color. But data.tasks only has ID and time.
                 // We need to look up task details from store or prop.
                 // Actually data.tasks contains minimal info. 
                 // Wait, CardTask interface in types/index.ts has name, color, isCompleted.
                 // So we can render them directly!
                 return (
                     <div key={`${task.id}-${task.startTime}`} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 group">
                         <button 
                             onClick={() => {
                                 const newTasks = data.tasks.map(t => 
                                     (t.id === task.id && t.startTime === task.startTime) ? { ...t, isCompleted: !t.isCompleted } : t
                                 );
                                 onUpdate({ ...data, tasks: newTasks });
                             }}
                             className={cn(
                                 "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                 task.isCompleted ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 text-transparent hover:border-blue-400"
                             )}
                         >
                             <Check className="w-3 h-3" />
                         </button>
                         <div className="flex-1 text-sm">
                             <span className={cn(
                                 "font-medium",
                                 task.isCompleted && "text-gray-400 line-through"
                             )}>
                                 {task.name}
                             </span>
                             <span className="text-xs text-gray-400 ml-2">
                                 {task.startTime} - {task.endTime}
                             </span>
                         </div>
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color }} />
                     </div>
                 );
             })}
             {data.tasks.length === 0 && (
                 <div className="text-xs text-gray-400 italic px-2">No scheduled tasks yet.</div>
             )}
        </div>

        <textarea 
            value={data.reflection}
            onChange={(e) => onUpdate({ ...data, reflection: e.target.value })}
            placeholder="What went well today? What could be improved?"
            className="w-full text-sm p-4 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-50 outline-none resize-none h-32 transition-all"
        />
      </div>
    </div>
  );
};