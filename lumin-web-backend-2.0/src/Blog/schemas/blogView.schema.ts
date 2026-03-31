import * as mongoose from 'mongoose';

import { LanguageEnum } from 'Blog/blogView.enum';

const BlogViewSchema = new mongoose.Schema({
  url: String,
  views: Number,
  language: {
    type: String,
    enum: LanguageEnum,
    default: LanguageEnum.EN,
  },
  author: String,
});

BlogViewSchema.index({ url: 1, language: 1 });
BlogViewSchema.index({ language: 1 });

export default BlogViewSchema;
