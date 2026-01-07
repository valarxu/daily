import React, { useState, useEffect, useRef } from 'react';
import { CardTask, Task } from '../../types';

interface TimeGridProps {
  tasks: CardTask[];
  onUpdateTasks: (tasks: CardTask[]) => void;
  selectedTask: Task | null;
}

const TOTAL_CELLS = 48;

export const TimeGrid: React.FC<TimeGridProps> = ({ tasks, onUpdateTasks, selectedTask }) => {
  const [gridState, setGridState] = useState<(string | null)[]>(Array(TOTAL_CELLS).fill(null));
  const gridRef = useRef<(string | null)[]>(Array(TOTAL_CELLS).fill(null));
  const [isDragging, setIsDragging] = useState(false);

  // Sync grid with tasks prop
  useEffect(() => {
    const newGrid = Array(TOTAL_CELLS).fill(null);
    tasks.forEach(task => {
      const startIdx = timeToIdx(task.startTime);
      const endIdx = timeToIdx(task.endTime);
      for (let i = startIdx; i < endIdx; i++) {
        newGrid[i] = task.id;
      }
    });
    setGridState(newGrid);
    gridRef.current = newGrid;
  }, [tasks]);

  const timeToIdx = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 2 + (m >= 30 ? 1 : 0);
  };

  const idxToTime = (idx: number) => {
    const col = Math.floor(idx / 6);
    const row = idx % 6;
    const totalMinutes = col * 180 + row * 30;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const labels = ['0:00', '3:00', '6:00', '9:00', '12:00', '15:00', '18:00', '21:00'];

  const handleMouseDown = (idx: number) => {
    if (!selectedTask) return;
    setIsDragging(true);
    applyTaskToCell(idx);
  };

  const handleMouseEnter = (idx: number) => {
    if (isDragging && selectedTask) {
      applyTaskToCell(idx);
    }
  };

  const applyTaskToCell = (idx: number) => {
    if (!selectedTask) return;
    const newGrid = [...gridRef.current];
    // Use task ID or name as identifier. Ideally ID.
    // If selectedTask is temporary (not saved yet), it might not have _id.
    // But store ensures tasks have _id? API response has _id.
    // If creating new task on fly, we might need a temp ID.
    // Let's assume selectedTask has _id or we use name as fallback.
    const taskId = selectedTask._id || selectedTask.name;
    
    newGrid[idx] = taskId;
    gridRef.current = newGrid;
    setGridState(newGrid);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      convertGridToTasks();
    }
  };

  const convertGridToTasks = () => {
    const currentGrid = gridRef.current;
    const newTasks: CardTask[] = [];
    let currentTaskId: string | null = null;
    let startIdx = 0;

    for (let i = 0; i < TOTAL_CELLS; i++) {
      const cellTaskId = currentGrid[i];
      
      if (cellTaskId !== currentTaskId) {
        if (currentTaskId) {
          newTasks.push(createTaskFromBlock(currentTaskId, startIdx, i));
        }
        currentTaskId = cellTaskId;
        startIdx = i;
      }
    }
    if (currentTaskId) {
       newTasks.push(createTaskFromBlock(currentTaskId, startIdx, TOTAL_CELLS));
    }
    
    onUpdateTasks(newTasks);
  };

  const createTaskFromBlock = (taskId: string, start: number, end: number): CardTask => {
    // Try to find task info from existing tasks or selectedTask
    const existing = tasks.find(t => t.id === taskId);
    
    let name = 'Unknown';
    let color = '#ccc';
    
    if (existing) {
        name = existing.name;
        color = existing.color;
    } else if (selectedTask && (selectedTask._id === taskId || selectedTask.name === taskId)) {
        name = selectedTask.name;
        color = selectedTask.color;
    }

    return {
      id: taskId,
      name,
      color,
      startTime: idxToTime(start),
      endTime: idxToTime(end),
      isCompleted: existing ? existing.isCompleted : false
    };
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging]); // Dependencies

  return (
    <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-gray-400 px-1">
            {labels.map(l => <span key={l}>{l}</span>)}
        </div>
        <div className="grid grid-cols-8 gap-2 select-none">
            {Array.from({ length: 8 }).map((_, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-2">
                    {Array.from({ length: 6 }).map((_, rowIdx) => {
                        const idx = colIdx * 6 + rowIdx;
                        const taskId = gridState[idx];
                        const task = tasks.find(t => t.id === taskId);
                        // If no saved task, check if this cell matches the temp selected task color
                        // But wait, the logic below was: if selectedTask is active, show its color?
                        // No, logic is: gridState stores taskId.
                        // If taskId is set, show task color.
                        // If taskId is NOT set (null), show empty.
                        // BUT, when hovering/dragging, we might want to show preview?
                        // The original code didn't do preview well, it just applied changes on drag.
                        // Let's keep it simple: gridState reflects current state.
                        
                        const color = task?.color;
                        
                        return (
                            <div
                                key={idx}
                                onMouseDown={() => handleMouseDown(idx)}
                                onMouseEnter={() => handleMouseEnter(idx)}
                                className={`
                                    aspect-square rounded border border-gray-200 cursor-pointer transition-colors
                                    ${!taskId ? 'bg-transparent border-dashed hover:border-blue-300' : 'border-transparent'}
                                `}
                                style={{ backgroundColor: taskId ? color : undefined }}
                                title={`${idxToTime(idx)} - ${idxToTime(idx + 1)}`}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
             <div className="w-4 h-4 border border-dashed border-gray-300 rounded"></div>
             <span className="text-xs text-gray-500">Each cell = 30 minutes</span>
        </div>
    </div>
  );
};