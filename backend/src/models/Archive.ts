import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskStat {
  name: string;
  totalCount: number;
  completedCount: number;
  totalTimeMinutes: number;
}

export interface IArchiveStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalTimeMinutes: number;
}

export interface IArchive extends Document {
  month: string; // YYYYMM
  cards: mongoose.Types.ObjectId[];
  stats: IArchiveStats;
  taskStats: ITaskStat[];
  aggregatedReflection: string;
  createdAt: Date;
}

const taskStatSchema = new Schema<ITaskStat>({
  name: { type: String, required: true },
  totalCount: { type: Number, required: true },
  completedCount: { type: Number, required: true },
  totalTimeMinutes: { type: Number, required: true },
}, { _id: false });

const archiveSchema = new Schema<IArchive>({
  month: { type: String, required: true, unique: true },
  cards: [{ type: Schema.Types.ObjectId, ref: 'Card' }],
  stats: {
    totalTasks: { type: Number, required: true },
    completedTasks: { type: Number, required: true },
    completionRate: { type: Number, required: true },
    totalTimeMinutes: { type: Number, required: true },
  },
  taskStats: [taskStatSchema],
  aggregatedReflection: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<IArchive>('Archive', archiveSchema);
