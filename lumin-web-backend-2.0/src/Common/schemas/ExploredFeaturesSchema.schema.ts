import mongoose from 'mongoose';

const ExploredFeaturesSchema = new mongoose.Schema({
  editPdf: {
    type: Number,
    default: 0,
  },
  formBuilder: {
    type: Number,
    default: 0,
  },
  ocr: {
    type: Number,
    default: 0,
  },
  splitPdf: {
    type: Number,
    default: 0,
  },
  summarization: {
    type: Number,
    default: 0,
  },
  redactPdf: {
    type: Number,
    default: 0,
  },
  protectPdf: {
    type: Number,
    default: 0,
  },
}, { _id: false });

export { ExploredFeaturesSchema };
