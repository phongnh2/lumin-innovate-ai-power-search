import { NotiFirebaseCommentFactory } from './NotiFirebaseComment/noti.firebase.comment.factory';
import { NotiFirebaseDocumentFactory } from './NotiFirebaseDocument/noti.firebase.document.factory';
import { NotiFirebaseFolderFactory } from './NotiFirebaseFolder/noti.firebase.folder.factory';
import { NotiFirebaseOrganizationFactory } from './NotiFirebaseOrganization/noti.firebase.organization.factory';
import { NotiFirebaseTeamFactory } from './NotiFirebaseTeam/noti.firebase.team.factory';

const notiFirebaseDocumentFactory = new NotiFirebaseDocumentFactory();
const notiFirebaseOrganizationFactory = new NotiFirebaseOrganizationFactory();
const notiFirebaseCommentFactory = new NotiFirebaseCommentFactory();
const notiFirebaseFolderFactory = new NotiFirebaseFolderFactory();
const notiFirebaseTeamFactory = new NotiFirebaseTeamFactory();

export {
  notiFirebaseDocumentFactory,
  notiFirebaseOrganizationFactory,
  notiFirebaseCommentFactory,
  notiFirebaseFolderFactory,
  notiFirebaseTeamFactory,
};
