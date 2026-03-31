import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const UserPurposeSchema = new mongoose.Schema({
  userId: ObjectId,
  purpose: {
    type: String,
    default: '',
  },
  currentStep: Number,
});

UserPurposeSchema.index({ userId: 1 });

export { UserPurposeSchema };
