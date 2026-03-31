import { NotiOrganizationFactory } from 'Common/factory/NotiFactory/NotiOrganization/noti.organization.factory';
import { NotiDocumentFactory } from 'Common/factory/NotiFactory/NotiDocument/noti.document.factory';
import { NotiTeamFactory } from 'Common/factory/NotiFactory/NotiTeam/noti.team.factory';
import { NotiFolderFactory } from 'Common/factory/NotiFactory/NotiFolder/noti.folder.factory';

const notiOrgFactory = new NotiOrganizationFactory();
const notiDocumentFactory = new NotiDocumentFactory();
const notiTeamFactory = new NotiTeamFactory();
const notiFolderFactory = new NotiFolderFactory();

export {
  notiOrgFactory,
  notiDocumentFactory,
  notiTeamFactory,
  notiFolderFactory,
};
