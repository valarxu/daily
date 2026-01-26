import mongoose, { Document, Schema } from 'mongoose';

export interface ICardTask {
  id: string;
  name: string;
  color: string;
  startTime: string; // HH:mm
  endTime: string;
  isCompleted: boolean;
}

export interface ICard extends Document {
  date: string;
  tasks: ICardTask[];
  isCompleted: boolean;
  reflection: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cardTaskSchema = new Schema<ICardTask>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
}, { _id: false });

const cardSchema = new Schema<ICard>({
  date: { type: String, required: true },
  tasks: [cardTaskSchema],
  isCompleted: { type: Boolean, default: false },
  reflection: { type: String, default: '' },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<ICard>('Card', cardSchema);