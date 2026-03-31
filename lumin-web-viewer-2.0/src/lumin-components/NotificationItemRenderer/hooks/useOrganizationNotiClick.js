import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { NotiFolder, NotiOrg, NotiOrgTeam } from 'constants/notificationConstant';
import { ORG_TEXT } from 'constants/organizationConstants';
import { Routers } from 'constants/Routers';
import { TEAM_TEXT, TEAMS_TEXT } from 'constants/teamConstant';
import { TEMPLATE_TABS } from 'constants/templateConstant';
import { TemplateAction, UrlSearchParam } from 'constants/UrlSearchParam';

import useHandleClickAgreementNotification from './useHandleClickAgreementNotification';

const { Organization: NotiOrgFolder } = NotiFolder.Notification;

export const useOrganizationNotiClick = ({ notification }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);

  const { handleClickRemoveMemberNotification, handleClickTransferAgreementToAnotherOrg } =
    useHandleClickAgreementNotification({ notification });

  const fetchOrganizationResources = (orgUrl) => {
    batch(() => {
      dispatch(actions.fetchCurrentOrganization(orgUrl));
      dispatch(actions.fetchOrganizations());
      dispatch(actions.fetchMainOrganization());
    });
  };

  const handleFolderNotification = () => {
    const {
      target: { targetId, targetData },
      actionType,
      entity: { id: entityId },
    } = notification;

    const redirectTo = (targetRoute) => {
      let redirectedUrl;
      if (NotiFolder.isOrganizationNoti(actionType)) {
        const { orgUrl } = targetData;
        fetchOrganizationResources(orgUrl);
        redirectedUrl = `/${ORG_TEXT}/${orgUrl}${targetRoute}`;
      } else {
        redirectedUrl = targetRoute;
      }
      navigate(redirectedUrl);
    };

    switch (actionType) {
      case NotiOrgFolder.CREATE_ORG_FOLDER:
        redirectTo(`${Routers.DOCUMENTS}/${ORG_TEXT}/folder/${entityId}`);
        break;
      case NotiOrgFolder.DELETE_ORG_FOLDER:
        redirectTo(`${Routers.DOCUMENTS}/${ORG_TEXT}`);
        break;
      case NotiOrgFolder.CREATE_TEAM_FOLDER:
        redirectTo(`${Routers.DOCUMENTS}/${TEAM_TEXT}/${targetId}/folder/${entityId}`);
        break;
      case NotiOrgFolder.DELETE_TEAM_FOLDER:
        redirectTo(`${Routers.DOCUMENTS}/${TEAM_TEXT}/${targetId}`);
        break;
      default:
        break;
    }
  };

  const handleOrgNotification = async () => {
    const redirectTo = (targetRoute = '', targetState = {}) => {
      const orgUrl = notification.entity?.entityData?.orgUrl || notification.target?.targetData?.orgUrl;
      fetchOrganizationResources(orgUrl);
      navigate(`/${ORG_TEXT}/${orgUrl}${targetRoute}`, { ...targetState });
    };

    const redirectToTemplatePage = ({ previewMode = false } = {}) => {
      const { targetData, type } = notification.target;
      const orgUrl = targetData?.orgUrl;
      const templateId = notification.entity?.id;
      const searchParams = `${UrlSearchParam.TEMPLATE_ID}=${templateId}&${UrlSearchParam.ACTION}=${TemplateAction.PREVIEW}`;
      let templateUrl = '';
      if (type === TEMPLATE_TABS.TEAM) {
        const { targetId } = notification.target;
        templateUrl = `/${ORG_TEXT}/${orgUrl}/templates/${TEAM_TEXT}/${targetId}`;
      } else {
        templateUrl = `/${ORG_TEXT}/${orgUrl}/templates/${ORG_TEXT}`;
      }
      if (previewMode) {
        navigate(`${templateUrl}?${searchParams}`);
      } else {
        navigate(templateUrl);
      }
    };

    switch (notification.actionType) {
      // Organization
      case NotiOrg.REQUEST_JOIN:
        redirectTo('/dashboard/people#requesting-access');
        break;
      case NotiOrg.INVITE_JOIN:
      case NotiOrg.TRANSFER_OWNER:
        if (notification.target.targetId === currentUser._id) {
          redirectTo(`/dashboard`);
        } else {
          redirectTo(`/members`);
        }
        break;
      case NotiOrg.UPDATE_USER_ROLE:
      case NotiOrg.GRANT_BILLING_MODERATOR:
      case NotiOrg.LEAVE_ORG:
        redirectTo('/members');
        break;
      case NotiOrg.ACCEPT_REQUEST_ACCESS_ORG:
        redirectTo(Routers.PERSONAL_DOCUMENTS);
        dispatch(actions.fetchOrganizations());
        break;
      case NotiOrg.REMOVE_MEMBER:
        if (notification.target.targetId === currentUser._id) {
          handleClickRemoveMemberNotification();
          return;
        }
        redirectTo('/members');
        break;
      case NotiOrg.REMOVE_DOCUMENT:
      case NotiOrg.DELETE_MULTI_DOCUMENT:
        redirectTo(`${Routers.DOCUMENTS}/${ORG_TEXT}`);
        break;
      case NotiOrg.DELETE_ORGANIZATION:
      case NotiOrg.LUMIN_ADMIN_DELETE_ORG:
        navigate('/organizations');
        dispatch(actions.fetchOrganizations());
        break;
      case NotiOrg.AUTO_JOIN_ORGANIZATION:
        redirectTo('/members');
        break;
      case NotiOrg.REMOVE_ASSOCIATE_DOMAIN:
        redirectTo('/dashboard/security');
        break;
      case NotiOrg.STOP_TRANSFER_ADMIN:
        redirectTo('/dashboard/people');
        break;
      case NotiOrg.CONVERT_TO_MAIN_ORGANIZATION:
      case NotiOrg.CONVERT_TO_CUSTOM_ORGANIZATION:
      case NotiOrg.INVITE_JOIN_SAME_UNPOPULAR_DOMAIN:
        redirectTo(Routers.DOCUMENTS);
        break;
      case NotiOrg.UPLOAD_TEMPLATE:
        redirectToTemplatePage({ previewMode: true });
        break;
      case NotiOrg.DELETE_ORGANIZATION_TEMPLATE:
        redirectToTemplatePage();
        break;
      case NotiOrg.DISABLED_AUTO_APPROVE:
      case NotiOrg.ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY:
      case NotiOrg.FIRST_USER_MANUALLY_JOIN_ORG:
        redirectTo('/dashboard/security?section=visibility');
        break;
      case NotiOrg.FIRST_MEMBER_INVITE_COLLABORATOR:
        redirectTo('/dashboard/security?section=invitePermission');
        break;
      case NotiOrg.MEMBERS_OF_FREE_CIRCLE_START_FREE_TRIAL:
      case NotiOrg.MEMBERS_OF_FREE_CIRCLE_UPGRADE_SUBSCRIPTION:
        redirectTo(`/dashboard/people?email=${encodeURIComponent(notification.actor.actorData.email)}`);
        break;
      case NotiOrg.DELETE_MULTI_FOLDER:
        redirectTo(`${Routers.DOCUMENTS}/${ORG_TEXT}`);
        break;
      case NotiOrg.JOIN_ORG_VIA_INVITE_LINK:
        redirectTo(`/dashboard/people?email=${encodeURIComponent(notification.actor.actorData.email)}`);
        break;
      case NotiOrg.TRANSFER_AGREEMENT_TO_ANOTHER_ORG:
        handleClickTransferAgreementToAnotherOrg();
        break;
      // Organization team
      case NotiOrgTeam.ADD_MEMBER:
        redirectTo(`/documents/${TEAM_TEXT}/${notification.target.targetId}`);
        break;
      case NotiOrgTeam.TRANSFER_OWNER:
        redirectTo(`/${TEAMS_TEXT}/${notification.target.targetId}/members`);
        break;
      case NotiOrgTeam.REMOVE_MEMBER:
      case NotiOrgTeam.LEAVE_ORG_TEAM:
        if (notification?.target?.targetId === currentUser._id) {
          return;
        }
        redirectTo(`/${TEAMS_TEXT}/${notification.entity.id}/members`);
        break;
      case NotiOrgTeam.DELETE_SINGLE_DOCUMENT:
      case NotiOrgTeam.DELETE_MULTIPLE_DOCUMENTS:
        redirectTo(`${Routers.DOCUMENTS}/${TEAM_TEXT}/${notification.target.targetId}`);
        break;
      case NotiOrgTeam.UPLOAD_TEMPLATE:
        redirectToTemplatePage({ previewMode: true });
        break;
      case NotiOrgTeam.DELETE_TEAM_TEMPLATE:
        redirectToTemplatePage();
        break;
      case NotiOrgTeam.DELETE_MULTI_FOLDER:
        redirectTo(`${Routers.DOCUMENTS}/${TEAM_TEXT}/${notification.target.targetId}`);
        break;
      case NotiOrgTeam.DELETE_TEAM:
        redirectTo(`/${TEAMS_TEXT}`);
        break;
      case NotiOrgTeam.TEAM_MEMBER_INVITED:
        redirectTo(`/documents/${TEAM_TEXT}/${notification.entity.id}`);
        break;
      case NotiOrg.ASSIGNED_SIGN_SEATS:
        redirectTo(`/sign/my-agreements`);
        break;
      case NotiOrg.UNASSIGNED_SIGN_SEATS:
      case NotiOrg.REJECT_SIGN_SEAT_REQUEST:
        redirectTo(`/members`);
        break;
      default:
        break;
    }
  };

  return {
    handleOrgNotification,
    handleFolderNotification,
  };
};
