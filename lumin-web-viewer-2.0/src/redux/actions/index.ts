import * as authActions from './authActions';
import * as customActions from './customActions';
import * as documentListActions from './documentListActions';
import * as exposedActions from './exposedActions';
import * as folderActions from './folderActions';
import * as generalActions from './generalActions';
import * as generalLayoutActions from './generalLayoutActions';
import * as homeActions from './homeActions';
import { ActionType } from './interface';
import * as internalActions from './internalActions';
import * as notificationActions from './notificationActions';
import * as organizationActions from './organizationActions';
import * as pageSearchActions from './pageSearchActions';
import * as userActions from './userActions';

const actions = {
  ...exposedActions,
  ...internalActions,
  ...authActions,
  ...customActions,
  ...notificationActions,
  ...organizationActions,
  ...documentListActions,
  ...folderActions,
  ...generalLayoutActions,
  ...userActions,
  ...pageSearchActions,
  ...homeActions,
  ...generalActions,
} as ActionType;

export default actions;
