import { Schema, model, Document } from 'mongoose';
import { IQuizAttempt } from '@edudeca/types';

export interface IQuizAttemptDocument extends Omit<IQuizAttempt, 'id'> {}

const DisciplineBreakdownSchema = new Schema(
  {
    tag: { type: String, required: true },
    correct: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const QuizAttemptSchema = new Schema<IQuizAttemptDocument>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      default: 10,
      min: 1,
    },
    totalQuestions: {
      type: Number,
      default: 10,
      min: 1,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeTaken: {
      type: Number,
      required: true, // in seconds
      min: 0,
    },
    earnedRdm: {
      type: Number,
      default: 0,
      min: 0,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    disciplineBreakdown: [DisciplineBreakdownSchema],
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for leaderboard aggregations and user history
QuizAttemptSchema.index({ level: 1, score: -1, timeTaken: 1 });
QuizAttemptSchema.index({ userId: 1, level: 1, completedAt: -1 });

export const QuizAttemptModel = model<IQuizAttemptDocument>(
  'QuizAttempt',
  QuizAttemptSchema
);
