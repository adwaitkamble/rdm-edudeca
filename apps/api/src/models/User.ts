import { Schema, model, Document } from 'mongoose';
import { UserProfile, TrackType } from '@edudeca/types';

export interface IUserDocument extends Omit<UserProfile, 'id'> {
  _id: string; // Clerk User ID
}

const UserSchema = new Schema<IUserDocument>(
  {
    _id: {
      type: String,
      required: true,
      description: 'Clerk User ID',
    },
    name: {
      type: String,
      required: true,
      default: 'Whiz Student',
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      default: function (this: any) {
        const id = this?._id || Math.floor(100000 + Math.random() * 900000);
        return `student_${id}@edudeca.student`;
      },
    },
    classGrade: {
      type: String,
      default: 'Class 11',
      trim: true,
    },
    scienceStream: {
      type: Boolean,
      default: true,
    },
    institution: {
      type: String,
      default: '',
      trim: true,
    },
    state: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    level4Consent: {
      type: Boolean,
      default: false,
    },
    selectedTrack: {
      type: String,
      enum: ['A', 'B', null],
      default: null,
    },
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
      index: true,
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    rdmBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    quizzesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    joinedRoomCode: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save hook to generate unique referralCode if not provided
UserSchema.pre('save', function (next) {
  if (!this.referralCode) {
    const cleanName = (this.name || 'WHIZ')
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .slice(0, 4);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.referralCode = `${cleanName || 'EDUD'}${randomSuffix}`;
  }
  next();
});

export const UserModel = model<IUserDocument>('User', UserSchema);
