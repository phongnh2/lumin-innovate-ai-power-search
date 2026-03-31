import * as customSelectors from './customSelectors';
import * as exposedSelectors from './exposedSelectors';
import * as folderSelectors from './folderSelectors';
import * as generalLayoutSelectors from './generalLayoutSelectors';
import * as generalSelectors from './generalSelectors';
import * as homeSelectors from './homeSelectors';
import * as notificationSelectors from './notificationSelectors';
import * as organizationSelectors from './organizationSelectors';
import * as pageSearchSelectors from './pageSearchSelectors';
import * as uploadingSelectors from './uploadingSelectors';

export default {
  ...exposedSelectors,
  ...customSelectors,
  ...organizationSelectors,
  ...folderSelectors,
  ...uploadingSelectors,
  ...notificationSelectors,
  ...generalLayoutSelectors,
  ...pageSearchSelectors,
  ...homeSelectors,
  ...generalSelectors,
};
