import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const UserContactSchema = new mongoose.Schema({
  userId: ObjectId,
  contacts: [
    {
      userId: String,
      recentActivity: Date,
    },
  ],
});

UserContactSchema.index({ userId: 1 });
UserContactSchema.index({ 'contacts.recentActivity': -1 });

export { UserContactSchema };
