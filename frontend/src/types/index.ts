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
  createdAt?: string;
  updatedAt?: string;
}