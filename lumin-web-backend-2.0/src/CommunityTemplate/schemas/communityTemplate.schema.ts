import * as mongoose from 'mongoose';
import { CommunityTemplateState, CommunityTemplateType } from 'graphql.schema';
import { MAX_CATEGORY_OF_TEMPLATE, MAX_TOTAL_KEYWORDS } from 'Common/constants/CommunityTemplateConstants';

function validateCategory(categories) {
  return categories.length <= MAX_CATEGORY_OF_TEMPLATE;
}

function validateMetaKeywords(metakeywords) {
  return metakeywords.length <= MAX_TOTAL_KEYWORDS;
}

function getBaseSchema({ required }: {required: boolean}): mongoose.Schema {
  const BaseSchema = new mongoose.Schema({
    name: {
      type: String,
      required,
    },
    url: {
      type: String,
      required,
      unique: true,
    },
    thumbnails: [String],
    description: {
      type: String,
      required,
    },
    categories: {
      type: [mongoose.Schema.Types.ObjectId],
      required,
      validate: [validateCategory, 'The maximum of categories is 3'],
    },
    metaTitle: String,
    metaDescription: String,
    metaKeywords: {
      type: [String],
      required,
      validate: [validateMetaKeywords, 'The maximum of metakeywords is 100'],
    },
  }, {
    _id: false,
  });

  return BaseSchema;
}

const RateTemplateSchema = new mongoose.Schema({
  rateAvg: {
    type: Number,
    default: 0,
  },
  rateCount: {
    type: Number,
    default: 0,
  },
}, {
  _id: false,
});

const CommunityTemplateCounterSchema = new mongoose.Schema({
  view: {
    type: Number,
    default: 0,
  },
  download: {
    type: Number,
    default: 0,
  },
}, {
  _id: false,
});

const BaseTemplateSchema = getBaseSchema({ required: true });
const DraftTemplateSchema = getBaseSchema({ required: false });

const CommunityTemplateSchema = new mongoose.Schema({
  ...BaseTemplateSchema.obj,
  remoteId: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  lastModifiedBy: mongoose.Schema.Types.ObjectId,
  publishDate: Date,
  status: {
    type: String,
    enum: CommunityTemplateState,
    required: true,
    default: CommunityTemplateState.UNPUBLISH,
  },
  type: {
    type: String,
    enum: CommunityTemplateType,
    required: true,
    default: CommunityTemplateType.SYSTEM,
  },
  counter: {
    type: CommunityTemplateCounterSchema,
    default: {},
  },
  rateStar: {
    type: RateTemplateSchema,
    default: {},
  },
  draftTemplate: {
    type: DraftTemplateSchema,
    default: undefined,
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: {
    createdAt: true,
    updatedAt: false,
  },
});

CommunityTemplateSchema.index({ name: 'text' });
CommunityTemplateSchema.index({ categories: 1 });
CommunityTemplateSchema.index({ url: 1 });
CommunityTemplateSchema.index({ 'draftTemplate.url': 1 }, {
  unique: true,
  partialFilterExpression: {
    'draftTemplate.url': {
      $exists: true,
    },
  },
});
export default CommunityTemplateSchema;
