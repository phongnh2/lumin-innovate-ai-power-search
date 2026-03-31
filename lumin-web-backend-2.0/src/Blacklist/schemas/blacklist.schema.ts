import * as mongoose from 'mongoose';

const BlacklistSchema = new mongoose.Schema({
  actionType: Number,
  value: String,
  metadata: Object,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

BlacklistSchema.index({ actionType: 1, value: 1 });
export default BlacklistSchema;
