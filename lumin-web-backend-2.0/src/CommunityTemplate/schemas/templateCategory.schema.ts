import * as mongoose from 'mongoose';
import slugify from 'slugify';

const TemplateCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  lastEditor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
}, {
  timestamps: {
    createdAt: true,
    updatedAt: true,
  },
});

TemplateCategorySchema.index({ slug: 1 });

TemplateCategorySchema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next();
});

export default TemplateCategorySchema;
