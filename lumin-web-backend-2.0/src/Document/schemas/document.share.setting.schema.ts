import * as mongoose from 'mongoose';

import { ShareSettingLinkTypeEnum, ShareSettingPermissionEnum } from 'Document/document.enum';

const ShareSettingSchema = new mongoose.Schema({
  permission: {
    type: String,
    default: ShareSettingPermissionEnum.SPECTATOR,
  },
  linkType: {
    type: String,
    default: ShareSettingLinkTypeEnum.INVITED,
  },
}, { _id: false });

export default ShareSettingSchema;
