import { Schema, model, Document } from 'mongoose';
import { IReferral } from '@edudeca/types';

export interface IReferralDocument extends Omit<IReferral, 'id'> {}

const ReferralSchema = new Schema<IReferralDocument>(
  {
    inviterId: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    invitedContact: {
      type: String,
      trim: true,
      default: '',
    },
    memberId: {
      type: String,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'joined', 'signed_up', 'rewarded'],
      default: 'pending',
      index: true,
    },
    rewardPaid: {
      type: Boolean,
      default: false,
    },
    rewardRdm: {
      type: Number,
      default: 50,
      min: 0,
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    joinedAt: {
      type: Date,
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

ReferralSchema.index({ inviterId: 1, email: 1 });
ReferralSchema.index({ inviterId: 1, phone: 1 });
ReferralSchema.index({ inviterId: 1, memberId: 1 });

export const ReferralModel = model<IReferralDocument>('Referral', ReferralSchema);
