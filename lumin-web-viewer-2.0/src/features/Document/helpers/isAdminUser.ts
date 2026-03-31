import get from 'lodash/get';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

export default (currentUser: IUser, document: IDocumentBase): boolean =>
  (document.isPersonal && document.ownerId === get(currentUser, '_id', '')) || Boolean(document.ownerOfTeamDocument);
