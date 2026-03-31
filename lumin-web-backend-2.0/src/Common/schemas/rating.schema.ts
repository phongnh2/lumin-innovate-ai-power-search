import * as mongoose from 'mongoose';
import { RatingModalStatus } from 'graphql.schema';

const RatingSchema = new mongoose.Schema({
  googleModalStatus: String,
  mobileFeedbackModalStatus: {
    status: {
      type: String,
      enum: RatingModalStatus,
      default: RatingModalStatus.NEVER_INTERACT,
    },
    nextModalAppearanceTime: String,
  },
}, { _id: false });

export { RatingSchema };
