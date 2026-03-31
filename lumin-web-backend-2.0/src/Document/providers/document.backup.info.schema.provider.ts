import { Model, Connection } from 'mongoose';

import DocumentBackupInfoSchema from '../schemas/document.backup.info.schema';

export default {
  provide: 'DocumentBackupInfo',
  useFactory: (connection: Connection): Model<any> => connection.model('DocumentBackupInfo', DocumentBackupInfoSchema),
  inject: ['DatabaseConnection'],
};
