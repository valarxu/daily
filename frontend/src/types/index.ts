export interface Task {
  _id?: string;
  name: string;
  color: string;
  isCommon?: boolean;
  cardId?: string;
}

export interface CardTask {
  id: string;
  name: string;
  color: string;
  startTime: string; // HH:mm
  endTime: string;
  isCompleted: boolean;
}

export interface Card {
  _id?: string;
  date: string;
  tasks: CardTask[];
  isCompleted: boolean;
  reflection: string;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArchiveStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalTimeMinutes: number;
}

export interface TaskStat {
  name: string;
  totalCount: number;
  completedCount: number;
  totalTimeMinutes: number;
}

export interface Archive {
  _id: string;
  month: string;
  cards: string[];
  stats: ArchiveStats;
  taskStats: TaskStat[];
  aggregatedReflection: string;
  createdAt: string;
}
