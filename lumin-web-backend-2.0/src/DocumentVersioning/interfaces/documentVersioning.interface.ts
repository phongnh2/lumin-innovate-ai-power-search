import { User } from 'User/interfaces/user.interface';

import { DocumentVersioningType } from './documentVersion.interface';

export interface DocumentVersioningData
  extends Omit<DocumentVersioningType, '_id' | 'modifiedBy'> {
  modifiedBy: {
    _id: User['_id'];
    name: User['name'];
  };
}
