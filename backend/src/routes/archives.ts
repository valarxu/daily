import express, { Request, Response } from 'express';
import Card, { ICard } from '../models/Card.js';
import Archive from '../models/Archive.js';
import Task from '../models/Task.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper to calculate duration in minutes
const calculateDuration = (start: string, end: string): number => {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return Math.max(0, endMinutes - startMinutes);
};

// Create Archive
router.post('/', async (req: Request, res: Response) => {
  try {
    const { month } = req.body; // YYYYMM

    if (!month || month.length !== 6) {
      throw new Error('Invalid month format. Expected YYYYMM.');
    }

    // Check if archive already exists
    const existingArchive = await Archive.findOne({ month });
    if (existingArchive) {
      throw new Error('Archive for this month already exists.');
    }

    // Find cards for this month
    const cards = await Card.find({
      date: { $regex: new RegExp(`^${month}`) },
      isArchived: { $ne: true }
    }).sort({ date: 1 });

    if (cards.length === 0) {
      throw new Error('No unarchived cards found for this month.');
    }

    // Fetch common tasks to filter
    const commonTasks = await Task.find({ isCommon: true });
    const commonTaskNames = new Set(commonTasks.map(t => t.name));

    // Stats variables
    let totalTasks = 0;
    let completedTasks = 0;
    let totalTimeMinutes = 0;
    let reflectionText = '';

    // Task aggregation
    const taskStatsMap = new Map<string, { totalCount: number, completedCount: number, totalTimeMinutes: number }>();

    cards.forEach((card: ICard) => {
      // Stats
      if (card.tasks) {
        totalTasks += card.tasks.length;
        card.tasks.forEach(task => {
          const duration = calculateDuration(task.startTime, task.endTime);
          
          if (task.isCompleted) {
            completedTasks++;
          }
          totalTimeMinutes += duration;

          // Aggregate by task name if it's a common task
          if (commonTaskNames.has(task.name)) {
            const current = taskStatsMap.get(task.name) || { totalCount: 0, completedCount: 0, totalTimeMinutes: 0 };
            current.totalCount++;
            if (task.isCompleted) {
              current.completedCount++;
            }
            current.totalTimeMinutes += duration;
            taskStatsMap.set(task.name, current);
          }
        });
      }

      // Reflection
      if (card.reflection && card.reflection.trim()) {
        const formattedDate = `${card.date.substring(0, 4)}-${card.date.substring(4, 6)}-${card.date.substring(6, 8)}`;
        reflectionText += `[${formattedDate}]\n${card.reflection}\n\n`;
      }
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Convert stats map to array
    const taskStats = Array.from(taskStatsMap.entries()).map(([name, stats]) => ({
      name,
      ...stats
    }));

    // Create Archive
    const newArchive = new Archive({
      month,
      cards: cards.map(c => c._id),
      stats: {
        totalTasks,
        completedTasks,
        completionRate,
        totalTimeMinutes
      },
      taskStats,
      aggregatedReflection: reflectionText.trim()
    });

    await newArchive.save();

    // Mark cards as archived
    await Card.updateMany(
      { _id: { $in: cards.map(c => c._id) } },
      { $set: { isArchived: true } }
    );

    res.status(201).json(newArchive);

  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Get all Archives
router.get('/', async (req: Request, res: Response) => {
  try {
    const archives = await Archive.find().sort({ month: -1 });
    res.json(archives);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Unarchive
router.put('/:id/unarchive', async (req: Request, res: Response) => {
  try {
    const archive = await Archive.findById(req.params.id);
    if (!archive) {
      throw new Error('Archive not found');
    }

    // Unarchive cards
    await Card.updateMany(
      { _id: { $in: archive.cards } },
      { $set: { isArchived: false } }
    );

    // Delete archive document
    await archive.deleteOne();

    res.json({ message: 'Unarchived successfully' });

  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router;
