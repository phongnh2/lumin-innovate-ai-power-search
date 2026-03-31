import { find, get } from 'lodash';
import { shallowEqual, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';

import selectors from 'selectors';

import { useGetCurrentOrganization, usePersonalWorkspaceLocation } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { UserSharingType } from 'constants/documentConstants';
import { NotiDocument } from 'constants/notificationConstant';
import { ORG_TEXT } from 'constants/organizationConstants';
import { ROUTE_MATCH } from 'constants/Routers';
import { TEAM_TEXT } from 'constants/teamConstant';
import { UrlSearchParam } from 'constants/UrlSearchParam';

export const useDocumentNotiClick = ({ notification }) => {
  const navigate = useNavigate();
  const currentOrg = useGetCurrentOrganization();
  const { isViewer } = useViewerMatch();
  const { documentId: viewerDocumentId } = useParams();
  const organizationList = useSelector(selectors.getOrganizationList, shallowEqual) || {};
  const isViewerMatched = Boolean(isViewer);
  const isMultipleDocument = get(notification, 'entity.entityData.multipleDocument', false);
  const isAtPersonalWorkspace = usePersonalWorkspaceLocation();

  const clickOnUploadOrgDocument = () => {
    const {
      target: { targetId },
      entity = {},
    } = notification;
    const { data: orgsData = [] } = organizationList;
    const organizations = orgsData.map(({ organization }) => organization);
    const { url: orgUrl } = find(organizations, { _id: targetId });
    if (isMultipleDocument) {
      navigate(`/${ORG_TEXT}/${orgUrl}/documents/${ORG_TEXT}`);
      return;
    }
    navigate(`/viewer/${entity.id}`);
  };

  const clickOnUploadOrgTeamDocument = () => {
    const {
      target: { targetId, targetData },
      entity = {},
    } = notification;
    const { orgUrl } = targetData;
    if (isMultipleDocument) {
      navigate(`/${ORG_TEXT}/${orgUrl}/documents/${TEAM_TEXT}/${targetId}`);
      return;
    }
    navigate(`/viewer/${entity.id}`);
  };

  return () => {
    const documentId = notification.entity?.id;
    const currentDocumentId = isViewer ? viewerDocumentId : null;
    const requesterId = notification.actor?.id;
    const isNavigateToTheSameDocument = currentDocumentId === documentId;
    const isNavigateToTheSameDocumentInViewer = isViewerMatched && isNavigateToTheSameDocument;
    if (!documentId && !isMultipleDocument) {
      return;
    }

    switch (notification.actionType) {
      case NotiDocument.DELETE: {
        if (isAtPersonalWorkspace) {
          navigate(ROUTE_MATCH.PREMIUM_USER_PATHS.SHARED_DOCUMENTS);
          return;
        }
        const orgUrl = currentOrg?.domain || organizationList.data[0]?.organization?.domain;
        navigate(ROUTE_MATCH.SHARED_DOCUMENTS.replace(':orgUrl', orgUrl));
        break;
      }
      case NotiDocument.UPLOAD_ORGANIZATION_DOCUMENT: {
        clickOnUploadOrgDocument();
        break;
      }
      case NotiDocument.UPLOAD_ORG_TEAM_DOCUMENT: {
        clickOnUploadOrgTeamDocument();
        break;
      }
      case NotiDocument.REQUEST_TO_ACCESS:
        if (isNavigateToTheSameDocumentInViewer || !isViewerMatched) {
          navigate({
            pathname: `/viewer/${documentId}`,
            search: `?${UrlSearchParam.REQUESTER_ID}=${requesterId}`,
          }, {
            state: { openShareModal: true },
          });
          break;
        }
        window.open(
          `/viewer/${documentId}?${UrlSearchParam.REQUESTER_ID}=${requesterId}&${UrlSearchParam.ACTION}=${UserSharingType.REQUEST_ACCESS}`,
          '_blank'
        );
        break;
      case NotiDocument.REQUEST_ACCEPTED:
      case NotiDocument.SHARE: {
        if (isNavigateToTheSameDocumentInViewer) {
          navigate(`/viewer/${documentId}`, { replace: true });
          break;
        }
        window.open(`/viewer/${documentId}`, '_blank');
        break;
      }
      default:
        if (isViewerMatched) {
          window.open(`/viewer/${documentId}`, '_blank');
          break;
        }
        navigate(`/viewer/${documentId}`);
        break;
    }
  };
};
