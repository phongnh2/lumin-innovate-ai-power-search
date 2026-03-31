import * as mongoose from 'mongoose';

import { DocumentTemplateSourceTypeEnum } from '../DocumentTemplate/documentTemplate.interface';

const DocumentTemplateSchema = new mongoose.Schema({
  templateSourceType: {
    type: String,
    enum: DocumentTemplateSourceTypeEnum,
    required: true,
  },
});

export default DocumentTemplateSchema;
