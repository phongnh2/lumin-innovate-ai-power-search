import * as mongoose from 'mongoose';

const DocumentFormSchema = new mongoose.Schema({
  name: String,
  size: Number,
  categories: [String],
  remoteId: String,
  mimeType: String,
  thumbnail: String,
  rateAvg: {
    type: Number,
    default: 0,
  },
  rateCount: {
    type: Number,
    default: 0,
  },
});

export default DocumentFormSchema;
