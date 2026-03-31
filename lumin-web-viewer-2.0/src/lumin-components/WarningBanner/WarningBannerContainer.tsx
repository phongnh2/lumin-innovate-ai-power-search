import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useMatch } from 'react-router';

import selectors from 'selectors';

import { useJoinOrgsMatch } from 'hooks';
import useShowInformDocument from 'hooks/useShowInformDocument';
import { useViewerMatch } from 'hooks/useViewerMatch';
import { useViewerMode } from 'hooks/useViewerMode';

import { matchPaths } from 'helpers/matchPaths';

import { useInviteCollaboratorsMatch } from 'features/CNC/hooks';
import { useMatchMediaLayoutContext } from 'features/MatchMediaLayout/hooks/useMatchMediaLayoutContext';

import { Routers, NEW_AUTH_FLOW_ROUTE } from 'constants/Routers';

import WarningBanner from './WarningBanner';

type WarningBannerContainerProps = {
  wrapper: React.ElementType;
  children: (props: { element: React.ReactNode }) => React.ReactNode;
};

function WarningBannerContainer({ wrapper: Wrapper, children }: WarningBannerContainerProps) {
  const location = useLocation();
  const isPaymentPage = Boolean(useMatch({ path: Routers.PAYMENT, end: false }));
  const isOneDriveAddInsAuthorizationPage = Boolean(
    useMatch({ path: Routers.ONE_DRIVE_ADD_INS_AUTHORIZATION, end: false })
  );
  const { isDriveGuestMode, isAnonymousMode } = useViewerMode();
  const isNewAuthFlowPage = matchPaths(
    Object.values(NEW_AUTH_FLOW_ROUTE).map((route) => ({ path: route, end: false })),
    location.pathname
  );
  const { isViewer } = useViewerMatch();
  const { isJoinOrgsPage } = useJoinOrgsMatch();
  const showInformDocumentGuide = useShowInformDocument();

  const isInPresenterMode = useSelector(selectors.isInPresenterMode);

  const { isNarrowScreen } = useMatchMediaLayoutContext();
  const { isInviteCollaboratorsPage } = useInviteCollaboratorsMatch();

  const isCompletedGettingUserData = useSelector<unknown, boolean>(selectors.getIsCompletedGettingUserData);

  const isIgnoredPages =
    isInviteCollaboratorsPage ||
    isOneDriveAddInsAuthorizationPage ||
    isJoinOrgsPage ||
    isNewAuthFlowPage ||
    isPaymentPage ||
    [Routers.ORGANIZATION_CREATE, Routers.REQUEST_ACCESS, Routers.REQUEST_SUBMITTED].includes(location.pathname);

  const canShowBanner =
    !(isNarrowScreen && isViewer) &&
    !isDriveGuestMode &&
    !isAnonymousMode &&
    !showInformDocumentGuide &&
    !isInPresenterMode;

  if (!isCompletedGettingUserData || !canShowBanner || isIgnoredPages) {
    return children({ element: null });
  }

  return <WarningBanner wrapper={Wrapper} renderChildren={children} />;
}

export default WarningBannerContainer;
