import { useSubscription } from '@apollo/client';
import { matchPath, useLocation } from 'react-router-dom';

import { SUB_FOLDER_EVENT } from 'graphQL/FolderGraph';

import { useGetCurrentOrganization, useGetCurrentTeam, useGetCurrentUser, useGetFolderType } from 'hooks';

import { folderType as TabType } from 'constants/documentConstants';
import { ROUTE_MATCH } from 'constants/Routers';
import SubscriptionConstants from 'constants/subscriptionConstant';

import { ITeam } from 'interfaces/team/team.interface';

interface FolderCountState {
  folderCount: number;
  incrementFolderCount: () => void;
  updateFolderCount: (count: number) => void;
}

const useFolderSubscriptions = (folderCountState: FolderCountState) => {
  const { folderCount, incrementFolderCount, updateFolderCount } = folderCountState;
  const { _id: userId } = useGetCurrentUser();
  const currentFolderType = useGetFolderType();
  const currentOrganization = useGetCurrentOrganization();
  const currentTeam = useGetCurrentTeam() as ITeam;
  const location = useLocation();

  const subscriptionClientId = (() => {
    switch (currentFolderType) {
      case TabType.INDIVIDUAL:
        return userId;
      case TabType.TEAMS:
        return currentTeam._id;
      case TabType.ORGANIZATION:
        return currentOrganization._id;
      default:
        return null;
    }
  })();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  useSubscription(SUB_FOLDER_EVENT, {
    variables: {
      input: {
        clientId: subscriptionClientId,
      },
    },
    onSubscriptionData: ({
      subscriptionData: {
        data: { folderEventSubscription },
      },
    }) => {
      if (!folderEventSubscription) {
        return;
      }
      const { eventType, workspaceId, total } = folderEventSubscription as {
        eventType: string;
        workspaceId: string;
        total: number;
      };
      const isInTheSameWorkspace = currentOrganization ? workspaceId === currentOrganization._id : false;
      const isAtPersonalDocuments = !!matchPath({ path: ROUTE_MATCH.PERSONAL_DOCUMENTS, end: true }, location.pathname);

      if (isAtPersonalDocuments && !isInTheSameWorkspace) {
        return;
      }
      if (eventType === SubscriptionConstants.Subscription.CREATE_FOLDER) {
        incrementFolderCount();
      } else {
        const newCount = Math.max(0, folderCount - total);
        updateFolderCount(newCount);
      }
    },
  });
};

export default useFolderSubscriptions;
