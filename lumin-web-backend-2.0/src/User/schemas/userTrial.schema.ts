import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const UserTrialSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
  },
  endTrial: {
    type: Date,
  },
  type: {
    type: String,
  },
});

UserTrialSchema.index({ userId: 1 });

UserTrialSchema.index({ endTrial: 1 });

export { UserTrialSchema };
