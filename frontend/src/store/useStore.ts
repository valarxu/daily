import { create } from 'zustand';
import { api } from '../lib/api';
import { Card, Task } from '../types';

interface State {
  cards: Card[];
  tasks: Task[];
  currentPage: number;
  totalPages: number;
  totalCards: number;
  fetchCards: (page?: number, limit?: number) => Promise<void>;
  fetchTasks: () => Promise<void>;
  addCard: (card: Partial<Card>) => Promise<void>;
  updateCard: (id: string, card: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, '_id'>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
  cards: [],
  tasks: [],
  currentPage: 1,
  totalPages: 1,
  totalCards: 0,
  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t._id !== id),
      }));
    } catch (e) {
      console.error(e);
    }
  },
  fetchCards: async (page = 1, limit = 7) => {
    try {
      const response = await api.get(`/cards?page=${page}&limit=${limit}`);
      set({ 
        cards: response.cards,
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCards: response.total
      });
    } catch (e) {
      console.error(e);
    }
  },
  fetchTasks: async () => {
    try {
      const tasks = await api.get('/tasks');
      set({ tasks });
    } catch (e) {
      console.error(e);
    }
  },
  addCard: async (card) => {
    try {
      const newCard = await api.post('/cards', card);
      set((state) => ({ cards: [newCard, ...state.cards] }));
    } catch (e) {
      console.error(e);
    }
  },
  updateCard: async (id, card) => {
    try {
      const updatedCard = await api.put(`/cards/${id}`, card);
      set((state) => ({
        cards: state.cards.map((c) => (c._id === id ? updatedCard : c)),
      }));
    } catch (e) {
      console.error(e);
    }
  },
  deleteCard: async (id) => {
    try {
      await api.delete(`/cards/${id}`);
      set((state) => ({
        cards: state.cards.filter((c) => c._id !== id),
      }));
    } catch (e) {
      console.error(e);
    }
  },
  addTask: async (task) => {
    try {
      const newTask = await api.post('/tasks', task);
      set((state) => ({ tasks: [...state.tasks, newTask] }));
    } catch (e) {
      console.error(e);
    }
  },
}));