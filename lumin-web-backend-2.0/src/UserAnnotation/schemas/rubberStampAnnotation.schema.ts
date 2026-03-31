import mongoose from 'mongoose';

const RubberStampPropertySchema = new mongoose.Schema({
  property: {
    bold: {
      type: Boolean,
      default: false,
    },
    italic: {
      type: Boolean,
      default: false,
    },
    strikeout: {
      type: Boolean,
      default: false,
    },
    underline: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: String,
    author: String,
    dateFormat: String,
    timeFormat: String,
    color: {
      type: String,
      default: '#000000',
    },
    textColor: {
      type: String,
      default: '#ffffff',
    },
    font: {
      type: String,
      default: 'Helvetica',
    },
  },
});

export { RubberStampPropertySchema };
