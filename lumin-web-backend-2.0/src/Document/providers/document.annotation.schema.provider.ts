import { Model, Connection } from 'mongoose';

import DocumentAnnotationSchema from '../schemas/document.annotation.schema';

export default {
  provide: 'DocumentAnnotation',
  useFactory: (connection: Connection): Model<any> => connection.model('DocumentAnnotation', DocumentAnnotationSchema),
  inject: ['DatabaseConnection'],
};
