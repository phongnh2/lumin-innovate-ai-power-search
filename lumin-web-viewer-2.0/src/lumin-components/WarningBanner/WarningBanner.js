import { useForceUpdate } from '@mantine/hooks';
import classNames from 'classnames';
import minBy from 'lodash/minBy';
import { IconButton, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { Suspense, useContext, useCallback } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useMatch } from 'react-router';

import selectors from 'selectors';

import EditorThemeProvider from 'lumin-components/ViewerCommonV2/ThemeProvider/EditorThemeProvider';
import PromptInviteUsersBanner from 'luminComponents/PromptInviteUsersBanner';
import { usePromptInviteUsersProps } from 'luminComponents/PromptInviteUsersBanner/hooks';

import { WarningBannerContext } from 'src/HOC/withWarningBanner';

import { useNetworkStatus } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import organizationServices from 'services/organizationServices';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { WarningBannerType } from 'constants/banner';
import { InviteBannerType, ORG_PATH } from 'constants/organizationConstants';
import { BillingWarningType } from 'constants/paymentConstant';
import { PaymentTypes } from 'constants/plan';
import { PaymentPlans } from 'constants/plan.enum';
import { Colors } from 'constants/styles';

import { useWarningBannerController, useShowLegacyBanner } from './hooks';
import useShowSetupDefaultWorkspace from './SetupDefaultWorkspace/hooks/useShowSetupDefaultWorkspace';
import TopViewer from './TopViewer';
import { useWorkspaceAnnouncement } from './WorkspaceAnnouncement/hooks';

import * as Styled from './WarningBanner.styled';

import styles from './WarningBanner.module.scss';

const BillingWarning = lazyWithRetry(() => import('./BillingWarning'));
const DeleteResourceWarning = lazyWithRetry(() => import('./DeleteResourceWarning'));
const WorkspaceAnnouncement = lazyWithRetry(() => import('./WorkspaceAnnouncement'));
const InformLegacySubscriptionTransition = lazyWithRetry(() => import('./InformLegacySubscriptionTransition'));
const BillingWarningUnpaidBanner = lazyWithRetry(() => import('./BillingWarningUnpaidBanner'));
const SetupDefaultWorkspace = lazyWithRetry(() => import('./SetupDefaultWorkspace'));
const AddMemberOrganizationModal = lazyWithRetry(() => import('luminComponents/AddMemberOrganizationModal'));

const propTypes = {
  wrapper: PropTypes.oneOfType([PropTypes.func, PropTypes.elementType]).isRequired,
  renderChildren: PropTypes.func.isRequired,
};

const highestPriorityBanner = minBy(Object.entries(WarningBannerType), ([, banner]) => banner.priority)[1];

// eslint-disable-next-line sonarjs/cognitive-complexity
function WarningBanner({ wrapper: Wrapper, renderChildren }) {
  const { isViewer } = useViewerMatch();
  const promptInviteUsersProps = usePromptInviteUsersProps();
  const { shouldShowBanner: shouldShowWorkspaceAnnouncement, handleCloseBanner: handleCloseWorkspaceAnnouncement } =
    useWorkspaceAnnouncement();

  const forceUpdate = useForceUpdate();
  const { isOffline } = useNetworkStatus();
  const controller = useWarningBannerController();

  const isOrgPage = useMatch(ORG_PATH);
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual) || {};
  const isShowTopViewerBanner = useSelector(selectors.getIsShowTopViewerBanner);

  const contextValue = useContext(WarningBannerContext);
  const {
    targetId,
    targetType,
    checkHasWarning,
    isLoading: isLoadingBillingWarning,
  } = contextValue[WarningBannerType.BILLING_WARNING.value];
  const { data: organizations, loading, error } = useSelector(selectors.getOrganizationList, shallowEqual);
  const currentOrganization =
    (!loading &&
      !error &&
      organizations.map(({ organization }) => organization).find((organization) => organization._id === targetId)) ||
    {};
  const { showLegacyCustomerMigration, handleCloseLegacyCustomerMigrationBanner } = useShowLegacyBanner({
    currentOrganization,
  });
  const isManager = organizationServices.isManager(currentOrganization?.userRole);

  const { showSetupDefaultWorkspace, handleCloseSetupDefaultWorkspace } = useShowSetupDefaultWorkspace({
    controller,
  });

  const renderButtonClose = useCallback(({ onClick, customColor, isReskin, banner }) => {
    if (isReskin) {
      const handleCloseBanner = (e) => {
        onClick(e);
        controller.setBannerClosed(banner);
      };
      return (
        <IconButton
          size="md"
          icon={<KiwiIcomoon type="x-md" color={customColor || 'var(--kiwi-colors-surface-inverse-surface)'} />}
          onClick={handleCloseBanner}
          data-cy="close_banner_button"
        />
      );
    }

    return (
      <Styled.CloseIconButton
        icon="close-btn"
        onClick={onClick}
        iconSize={20}
        size="medium"
        iconColor={customColor || Colors.PRIMARY}
      />
    );
  }, []);

  const makeBanner = ({ Component, props = {}, currentBanner }) => {
    const { isBannerClosed, nextBanner, closedBanners } = controller.getState();

    if (isBannerClosed) {
      const isNextBannerTriggered = nextBanner && currentBanner !== nextBanner;
      const isClosedBannerReTriggered = closedBanners[currentBanner];
      if (isNextBannerTriggered || isClosedBannerReTriggered) {
        controller.reset();
        forceUpdate();
        return null;
      }

      if (!nextBanner) {
        controller.setNextBanner(currentBanner);
      }

      return null;
    }

    return {
      Component,
      props,
    };
  };

  // NOTE: If the banner takes time to retrieve data for display, make sure to check the loading state and return null during loading (e.g., BILLING_WARNING, ...).
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const getWarningBanner = (banner) => {
    if (!banner) {
      return null;
    }

    const { value, priority } = banner;

    switch (value) {
      case WarningBannerType.LEGACY_CUSTOMER_MIGRATION.value:
        if (PaymentPlans.BUSINESS === currentOrganization?.payment?.type && showLegacyCustomerMigration) {
          return makeBanner({
            Component: InformLegacySubscriptionTransition,
            props: { handleCloseBanner: handleCloseLegacyCustomerMigrationBanner },
            currentBanner: value,
          });
        }
        break;

      case WarningBannerType.BILLING_WARNING.value:
        if (isLoadingBillingWarning) {
          return null;
        }
        if (checkHasWarning(targetId) && (targetType === PaymentTypes.INDIVIDUAL || isManager)) {
          return makeBanner({
            Component: BillingWarning,
            props: {
              clientId: targetId,
              type: targetType,
              renderClose: renderButtonClose,
            },
            currentBanner: value,
          });
        }
        break;

      // TODO-UBM: merge this banner to BILLING_WARNING
      case WarningBannerType.BILLING_WARNING_UNPAID.value: {
        if (isLoadingBillingWarning) {
          return null;
        }
        if (checkHasWarning(targetId, BillingWarningType.UNPAID_SUBSCRIPTION)) {
          return makeBanner({
            Component: BillingWarningUnpaidBanner,
            currentBanner: value,
          });
        }
        break;
      }

      case WarningBannerType.DELETE_RESOURCE.value: {
        const canShowDeleteOrg = Boolean(currentOrganization.deletedAt && isOrgPage);
        const canShowDeleteAccount = Boolean(currentUser?.deletedAt && !isOrgPage);
        if (canShowDeleteOrg || canShowDeleteAccount) {
          return makeBanner({
            Component: DeleteResourceWarning,
            props: {
              currentOrganization,
              currentUser,
              canShowDeleteAccount,
              canShowDeleteOrg,
            },
            currentBanner: value,
          });
        }
        break;
      }

      case WarningBannerType.WORKSPACE_ANNOUNCEMENT.value: {
        if (shouldShowWorkspaceAnnouncement) {
          return makeBanner({
            Component: WorkspaceAnnouncement,
            props: {
              renderClose: renderButtonClose,
              onClose: handleCloseWorkspaceAnnouncement,
            },
            currentBanner: value,
          });
        }
        break;
      }

      case WarningBannerType.SETUP_DEFAULT_WORKSPACE.value: {
        if (showSetupDefaultWorkspace) {
          return makeBanner({
            Component: SetupDefaultWorkspace,
            props: {
              onClose: handleCloseSetupDefaultWorkspace,
            },
            currentBanner: value,
          });
        }
        break;
      }

      case WarningBannerType.VIEWER_BANNER.value: {
        if (isViewer && isShowTopViewerBanner) {
          return makeBanner({
            Component: TopViewer,
            props: {
              renderClose: renderButtonClose,
            },
            currentBanner: value,
          });
        }
        break;
      }

      case WarningBannerType.ACCEPT_PENDING_REQUEST.value: {
        const { loading: isFetching, canShowBanner, isShowBanner, promptUsersData } = promptInviteUsersProps;
        if (isFetching) {
          return null;
        }
        if (canShowBanner && isShowBanner && promptUsersData.bannerType === InviteBannerType.PENDING_REQUEST) {
          return makeBanner({
            Component: PromptInviteUsersBanner,
            props: promptInviteUsersProps,
            currentBanner: value,
          });
        }
        break;
      }

      case WarningBannerType.GOOGLE_COLLABORATORS.value: {
        const { loading: isFetching, canShowBanner, isShowBanner, promptUsersData } = promptInviteUsersProps;
        if (isFetching) {
          return null;
        }
        if (canShowBanner && isShowBanner && promptUsersData.bannerType === InviteBannerType.GOOGLE_CONTACT) {
          return makeBanner({
            Component: PromptInviteUsersBanner,
            props: promptInviteUsersProps,
            currentBanner: value,
          });
        }
        break;
      }

      default:
        break;
    }

    // Try the next banner in priority
    const nextBannerKey = Object.keys(WarningBannerType).find((k) => WarningBannerType[k].priority === priority + 1);

    return getWarningBanner(WarningBannerType[nextBannerKey]);
  };

  const { Component, props } = getWarningBanner(highestPriorityBanner) || {};

  return (
    <>
      {Component
        ? renderChildren({
            element: (
              <EditorThemeProvider>
                <Wrapper className={classNames({ [styles.disabled]: isOffline })}>
                  <Suspense fallback={<div />}>
                    <Component {...props} />
                  </Suspense>
                </Wrapper>
              </EditorThemeProvider>
            ),
          })
        : renderChildren({ element: null })}
      {promptInviteUsersProps.isShowAddMembersModal ? (
        <Suspense fallback={null}>
          <AddMemberOrganizationModal {...promptInviteUsersProps.addMemberOrganizationModalProps} />
        </Suspense>
      ) : null}
    </>
  );
}

WarningBanner.propTypes = propTypes;

export default React.memo(WarningBanner);
