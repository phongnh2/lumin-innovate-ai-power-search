import { UserAnnotationType } from 'UserAnnotation/userAnnotation.enum';
import * as mongoose from 'mongoose';

const UserAnnotationSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: UserAnnotationType,
    required: true,
  },
}, {
  discriminatorKey: 'type',
  timestamps: true,
});

UserAnnotationSchema.index({ ownerId: 1, type: 1, weight: -1 });

export { UserAnnotationSchema };
