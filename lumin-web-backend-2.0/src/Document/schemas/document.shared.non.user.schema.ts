import * as mongoose from 'mongoose';

const documentSharedNonUserSchema = new mongoose.Schema({
  documentId: mongoose.Schema.Types.ObjectId,
  email: String,
  role: String,
  message: String,
  type: String,
  sharerId: mongoose.Schema.Types.ObjectId,
  teamId: mongoose.Schema.Types.ObjectId,
});

documentSharedNonUserSchema.index({ documentId: 1 });
documentSharedNonUserSchema.index({ email: 1 });
documentSharedNonUserSchema.index({ teamId: 1 });

export default documentSharedNonUserSchema;
