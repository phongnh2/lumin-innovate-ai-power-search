import { IDocument } from 'Document/interfaces/document.interface';
import { User } from 'graphql.schema';

import { Modify } from '../../NotiFactory/noti.interface';
import { NotiFirebaseInterface } from '../noti.firebase.interface';

export type NotiFirebaseCommentInterface = Modify<
  NotiFirebaseInterface,
  {
    actor?: Partial<User>;
    document: Partial<IDocument>;

    annotationId?: Partial<string>;
    annotationTypeShowed?: Partial<string>;
  }
>;
