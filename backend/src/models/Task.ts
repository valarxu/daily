import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  name: string;
  color: string;
  isCommon: boolean;
  cardId?: string;
  createdAt: Date;
}

const taskSchema = new Schema<ITask>({
  name: { type: String, required: true },
  color: { type: String, required: true },
  isCommon: { type: Boolean, default: false },
  cardId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ITask>('Task', taskSchema);