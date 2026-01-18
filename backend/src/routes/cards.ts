import express, { Request, Response } from 'express';
import Card from '../models/Card.js';

const router = express.Router();

// Get cards with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 7;
    const skip = (page - 1) * limit;

    const [cards, total] = await Promise.all([
      Card.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Card.countDocuments()
    ]);

    res.json({
      cards,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

// Create a card
router.post('/', async (req: Request, res: Response) => {
  try {
    const card = new Card(req.body);
    const newCard = await card.save();
    res.status(201).json(newCard);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Update a card
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    Object.assign(card, req.body);
    const updatedCard = await card.save();
    res.json(updatedCard);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

// Delete a card
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    await card.deleteOne();
    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;