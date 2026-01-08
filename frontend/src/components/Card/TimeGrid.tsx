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

  const labels = ['0:00', '4:00', '8:00', '12:00', '16:00', '20:00'];

  // New Logic: 
  // 6 Rows. Each row represents 4 hours.
  // 8 Columns. 
  // Row 0: 0:00 - 4:00. Cols: 0:00, 0:30, 1:00, 1:30, 2:00, 2:30, 3:00, 3:30.
  // Row 1: 4:00 - 8:00.
  // ...
  // This matches the previous 8x6 grid logic where each cell is 30 mins.
  // Total 48 cells.
  
  const timeToIdx = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m;
    const row = Math.floor(totalMinutes / 240); // 4 hours = 240 mins
    const remainder = totalMinutes % 240;
    const col = Math.floor(remainder / 30);
    return row * 8 + col;
  };

  const idxToTime = (idx: number) => {
    const row = Math.floor(idx / 8);
    const col = idx % 8;
    const totalMinutes = row * 240 + col * 30;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const dragModeRef = useRef<'paint' | 'erase'>('paint');

  const handleMouseDown = (idx: number) => {
    if (!selectedTask) return;
    setIsDragging(true);
    
    // Determine mode based on initial cell
    const currentTaskId = gridRef.current[idx];
    const selectedTaskId = selectedTask._id || selectedTask.name;
    
    if (currentTaskId === selectedTaskId) {
        dragModeRef.current = 'erase';
    } else {
        dragModeRef.current = 'paint';
    }
    
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
    const taskId = selectedTask._id || selectedTask.name;
    
    if (dragModeRef.current === 'erase') {
        // Only erase if it matches our task (optional, or erase anything?)
        // Usually erase meant "toggle off". So if it matches, set to null.
        if (newGrid[idx] === taskId) {
            newGrid[idx] = null;
        }
    } else {
        // Paint mode: overwrite
        newGrid[idx] = taskId;
    }
    
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
    <div className="flex gap-2">
        {/* Y-axis Labels (Rows) */}
        <div className="flex flex-col justify-between text-xs text-gray-400 py-1 h-[192px]">
            {['0:00', '4:00', '8:00', '12:00', '16:00', '20:00'].map(l => <span key={l}>{l}</span>)}
        </div>
        
        <div className="flex flex-col gap-2">
             <div className="grid grid-cols-8 gap-2 select-none">
                {/* We render cells linearly, 0-47. CSS Grid handles wrapping. */}
                {/* Wait, the previous code used nested loops for cols/rows. */}
                {/* Let's use a flat map for simplicity if we just want 8 cols x 6 rows. */}
                {Array.from({ length: 48 }).map((_, idx) => {
                    const taskId = gridState[idx];
                    const task = tasks.find(t => t.id === taskId);
                    const color = task?.color;
                    
                    return (
                        <div
                            key={idx}
                            onMouseDown={() => handleMouseDown(idx)}
                            onMouseEnter={() => handleMouseEnter(idx)}
                            className={`
                                w-6 h-6 rounded border border-gray-200 cursor-pointer transition-colors
                                ${!taskId ? 'bg-transparent border-dashed hover:border-blue-300' : 'border-transparent'}
                            `}
                            style={{ backgroundColor: taskId ? color : undefined }}
                            title={`${idxToTime(idx)} - ${idxToTime(idx + 1)}`}
                        />
                    );
                })}
            </div>
            <div className="flex items-center gap-2 mt-2">
                 <div className="w-4 h-4 border border-dashed border-gray-300 rounded"></div>
                 <span className="text-xs text-gray-500">Each cell = 30 minutes</span>
            </div>
        </div>
    </div>
  );
};