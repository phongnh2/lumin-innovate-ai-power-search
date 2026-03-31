import * as mongoose from 'mongoose';

import { ActionFunctionalLandingPageRatingEnums } from 'FunctionalLandingPageRating/functional-landing-page-rating.enum';

export const FunctionalLandingPageRatingSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      unique: true,
      enum: ActionFunctionalLandingPageRatingEnums,
    },
    stars: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
    totalVotes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

FunctionalLandingPageRatingSchema.index({ action: 1 });

export interface FunctionalLandingPageRating extends mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  action: string;
  stars: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  totalVotes: number;
}
