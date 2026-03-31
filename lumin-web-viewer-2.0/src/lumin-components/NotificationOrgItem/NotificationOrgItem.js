import PropTypes from 'prop-types';
import React from 'react';

import { NotiOrg, NotiOrgTeam } from 'constants/notificationConstant';

import AcceptRequestAccess from './components/AcceptRequestAccess';
import AddMemberToOrg from './components/AddMemberToOrg';
import AddMemberToOrgSameUnpopularDomain from './components/AddMemberToOrgSameUnpopularDomain';
import AddMemberToTeam from './components/AddMemberToTeam';
import AnyoneCanJoinEnabledAutomatically from './components/AnyoneCanJoinEnabledAutomatically';
import AssignedSignSeats from './components/AssignedSignSeats';
import AutoJoinOrganization from './components/AutoJoinOrganization';
import ConvertToCustomOrganization from './components/ConvertToCustomOrganization';
import ConvertToMainOrganization from './components/ConvertToMainOrganization';
import DeleteMultiOrgFolder from './components/DeleteMultiOrgFolders';
import DeleteMultiOrgTeamFolder from './components/DeleteMultiOrgTeamFolder';
import DeleteMultipleDoc from './components/DeleteMultipleDoc';
import DeleteOrganization from './components/DeleteOrganization';
import DeleteOrgTeamDocuments from './components/DeleteOrgTeamDocuments';
import DeleteOrgTemplate from './components/DeleteOrgTemplate';
import DeleteTeam from './components/DeleteTeam';
import DeleteTeamTemplate from './components/DeleteTeamTemplate';
import DisabledAutoApprove from './components/DisabledAutoApprove';
import FirstMemberInviteCollaborator from './components/FirstMemberInviteCollaborator';
import FirstUserManuallyJoinOrg from './components/FirstUserManuallyJoinOrg';
import JoinOrgViaInviteLink from './components/JoinOrgViaInviteLink';
import LeaveOrg from './components/LeaveOrg';
import LeaveOrgTeam from './components/LeaveOrgTeam';
import LuminAdminDeleteOrg from './components/LuminAdminDeleteOrg';
import MembersOfFreeCircleStartFreeTrial from './components/MembersOfFreeCircleStartFreeTrial';
import MembersOfFreeCircleUpgradeSubscription from './components/MembersOfFreeCircleUpgradeSubscription';
import RejectedSignSeatsRequest from './components/RejectedSignSeatsRequest';
import RemoveAssociateDomain from './components/RemoveAssociateDomain';
import RemoveMember from './components/RemoveMember';
import RemoveOrgDocument from './components/RemoveOrgDocument';
import RemoveTeamMember from './components/RemoveTeamMember';
import RequestToJoin from './components/RequestToJoin';
import StopTransferAdmin from './components/StopTransferAdmin';
import TeamMemberInvited from './components/TeamMemberInvited';
import TransferAdmin from './components/TransferAdmin';
import TransferAgreementToAnotherOrg from './components/TransferAgreementToAnotherOrg';
import TransferTeamOwnerNoti from './components/TransferTeamOwnerNoti';
import UnassignedSignSeats from './components/UnassignedSignSeats';
import UpdateUserRole from './components/UpdateUserRole';
import UploadOrgTeamTemplate from './components/UploadOrgTeamTemplate';
import UploadOrgTemplate from './components/UploadOrgTemplate';

NotificationOrgItem.propTypes = {
  notification: PropTypes.object,
  currentUser: PropTypes.object,
};

NotificationOrgItem.defaultProps = {
  notification: {},
  currentUser: {},
};

function NotificationOrgItem(props) {
  const { notification, currentUser } = props;
  const maps = {
    [NotiOrg.REQUEST_JOIN]: <RequestToJoin notification={notification} />,
    [NotiOrg.INVITE_JOIN]: <AddMemberToOrg notification={notification} currentUser={currentUser} />,
    [NotiOrg.UPDATE_USER_ROLE]: <UpdateUserRole notification={notification} currentUser={currentUser} />,
    [NotiOrg.REMOVE_MEMBER]: <RemoveMember notification={notification} currentUser={currentUser} />,
    [NotiOrg.LEAVE_ORG]: <LeaveOrg notification={notification} />,
    [NotiOrg.TRANSFER_OWNER]: <TransferAdmin notification={notification} currentUser={currentUser} />,
    [NotiOrg.REMOVE_DOCUMENT]: <RemoveOrgDocument notification={notification} />,
    [NotiOrg.ACCEPT_REQUEST_ACCESS_ORG]: <AcceptRequestAccess notification={notification} currentUser={currentUser} />,
    [NotiOrg.DELETE_MULTI_DOCUMENT]: <DeleteMultipleDoc notification={notification} />,
    [NotiOrg.DISABLED_AUTO_APPROVE]: <DisabledAutoApprove notification={notification} />,
    [NotiOrg.AUTO_JOIN_ORGANIZATION]: <AutoJoinOrganization notification={notification} />,
    [NotiOrg.DELETE_ORGANIZATION]: <DeleteOrganization notification={notification} />,
    [NotiOrg.STOP_TRANSFER_ADMIN]: <StopTransferAdmin notification={notification} />,
    [NotiOrg.CONVERT_TO_MAIN_ORGANIZATION]: <ConvertToMainOrganization notification={notification} />,
    [NotiOrg.CONVERT_TO_CUSTOM_ORGANIZATION]: <ConvertToCustomOrganization notification={notification} />,
    [NotiOrg.DELETE_ORGANIZATION_TEMPLATE]: <DeleteOrgTemplate notification={notification} />,
    [NotiOrg.UPLOAD_TEMPLATE]: <UploadOrgTemplate notification={notification} />,
    [NotiOrg.REMOVE_ASSOCIATE_DOMAIN]: <RemoveAssociateDomain notification={notification} />,
    [NotiOrg.FIRST_USER_MANUALLY_JOIN_ORG]: <FirstUserManuallyJoinOrg notification={notification} />,
    [NotiOrg.FIRST_MEMBER_INVITE_COLLABORATOR]: <FirstMemberInviteCollaborator notification={notification} />,
    [NotiOrg.INVITE_JOIN_SAME_UNPOPULAR_DOMAIN]: (
      <AddMemberToOrgSameUnpopularDomain notification={notification} currentUser={currentUser} />
    ),
    [NotiOrg.MEMBERS_OF_FREE_CIRCLE_START_FREE_TRIAL]: (
      <MembersOfFreeCircleStartFreeTrial notification={notification} />
    ),
    [NotiOrg.MEMBERS_OF_FREE_CIRCLE_UPGRADE_SUBSCRIPTION]: (
      <MembersOfFreeCircleUpgradeSubscription notification={notification} />
    ),
    [NotiOrg.ANYONE_CAN_JOIN_ENABLED_AUTOMATICALLY]: <AnyoneCanJoinEnabledAutomatically notification={notification} />,
    [NotiOrg.DELETE_MULTI_FOLDER]: <DeleteMultiOrgFolder notification={notification} />,
    [NotiOrg.JOIN_ORG_VIA_INVITE_LINK]: <JoinOrgViaInviteLink notification={notification} />,
    [NotiOrg.TRANSFER_AGREEMENT_TO_ANOTHER_ORG]: <TransferAgreementToAnotherOrg notification={notification} />,
    [NotiOrg.LUMIN_ADMIN_DELETE_ORG]: <LuminAdminDeleteOrg notification={notification} />,
    [NotiOrgTeam.ADD_MEMBER]: <AddMemberToTeam notification={notification} currentUser={currentUser} />,
    [NotiOrgTeam.TRANSFER_OWNER]: <TransferTeamOwnerNoti notification={notification} currentUser={currentUser} />,
    [NotiOrgTeam.REMOVE_MEMBER]: <RemoveTeamMember notification={notification} currentUser={currentUser} />,
    [NotiOrgTeam.DELETE_TEAM]: <DeleteTeam notification={notification} />,
    [NotiOrgTeam.LEAVE_ORG_TEAM]: <LeaveOrgTeam notification={notification} />,
    [NotiOrgTeam.DELETE_SINGLE_DOCUMENT]: <DeleteOrgTeamDocuments single notification={notification} />,
    [NotiOrgTeam.DELETE_MULTIPLE_DOCUMENTS]: <DeleteOrgTeamDocuments notification={notification} />,
    [NotiOrgTeam.DELETE_TEAM_TEMPLATE]: <DeleteTeamTemplate notification={notification} />,
    [NotiOrgTeam.UPLOAD_TEMPLATE]: <UploadOrgTeamTemplate notification={notification} />,
    [NotiOrgTeam.DELETE_MULTI_FOLDER]: <DeleteMultiOrgTeamFolder notification={notification} />,
    [NotiOrgTeam.TEAM_MEMBER_INVITED]: <TeamMemberInvited notification={notification} />,
    [NotiOrg.ASSIGNED_SIGN_SEATS]: <AssignedSignSeats notification={notification} />,
    [NotiOrg.UNASSIGNED_SIGN_SEATS]: <UnassignedSignSeats notification={notification} />,
    [NotiOrg.REJECT_SIGN_SEAT_REQUEST]: <RejectedSignSeatsRequest notification={notification} />,
  };
  /**
   * must return null to fallback incorrect workspace notification type
   */
  return maps[notification.actionType] || null;
}

export default NotificationOrgItem;
