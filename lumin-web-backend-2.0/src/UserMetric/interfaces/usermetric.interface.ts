import { Types } from 'mongoose';

export interface IUserMetricModel {
  userId: any;
  email: string;
  initPlan: string;
  shareCount: number,
  annotateCount: number,
  openDocument: {
    ownedCount: number,
    freeCount: number,
    freeTrialCount: number,
    premiumCount: number,
    teamCount: number
  },
  plan: {
    type: string,
    period: string,
  }
}

export interface IUserMetric extends IUserMetricModel {
  _id: Types.ObjectId;
}
