import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const MembershipSchema = new mongoose.Schema({
  userId: ObjectId,
  teamId: ObjectId,
  role: String,
});

MembershipSchema.index({ userId: 1, teamId: 1 }, { unique: true });
MembershipSchema.index({ teamId: 1 });
MembershipSchema.index({ role: 1 });

export default MembershipSchema;
