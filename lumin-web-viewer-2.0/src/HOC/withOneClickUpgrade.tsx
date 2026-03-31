import React, { ComponentType, createContext, useContext, useMemo, useRef, useCallback } from 'react';
import { Trans } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import SignSeatModalComponent from 'screens/OrganizationDashboard/components/OrganizationPeople/components/SignSeatModal';

import { useSignSeatModal, useUpdateSignSeatSubscription } from 'hooks';
import { SelectedMember } from 'hooks/useSignSeatModal';

import { matchPaths } from 'helpers/matchPaths';

import { toastUtils } from 'utils';

import { CUSTOM_EVENT } from 'constants/customEvent';
import { ModalTypes } from 'constants/lumin-common';
import { ORGANIZATION_ROUTERS } from 'constants/organizationConstants';
import { ROUTE_MATCH } from 'constants/Routers';

type WithOneClickUpgradeProps = Record<string, unknown>;

interface IOneClickUpgradeContext {
  openOneClickUpgradeModal: (member: SelectedMember, orgId: string) => void;
  skipNextNotification: () => void;
}

const OneClickUpgradeContext = createContext<IOneClickUpgradeContext | undefined>(undefined);

export const useOneClickUpgradeContext = (): IOneClickUpgradeContext => {
  const context = useContext(OneClickUpgradeContext);
  if (!context) {
    throw new Error('useOneClickUpgradeContext must be used within withOneClickUpgrade HOC');
  }
  return context;
};

export const useOptionalOneClickUpgradeContext = (): IOneClickUpgradeContext | undefined =>
  useContext(OneClickUpgradeContext);

const ONE_CLICK_UPGRADE_PATHS = [
  ...ORGANIZATION_ROUTERS,
  ROUTE_MATCH.VIEWER,
  ROUTE_MATCH.VIEWER_TEMP_EDIT,
  ROUTE_MATCH.VIEWER_TEMP_EDIT_EXTERNAL_PDF,
  ROUTE_MATCH.GUEST_VIEW,
  ROUTE_MATCH.TEMPLATE_VIEWER,
];

export default function withOneClickUpgrade<P extends WithOneClickUpgradeProps>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> {
  const WithOneClickUpgradeComponent = (props: P): React.ReactElement => {
    const location = useLocation();
    const { openModal, selectedMember, organizationId, closeModal } = useSignSeatModal();

    const ignoreNextSubscriptionRef = useRef<boolean>(false);

    const skipNextNotification = useCallback(() => {
      ignoreNextSubscriptionRef.current = true;
    }, []);

    useUpdateSignSeatSubscription(ignoreNextSubscriptionRef);

    const isEligibleRoute = useMemo(
      () =>
        matchPaths(
          ONE_CLICK_UPGRADE_PATHS.map((path) => ({ path, end: false })),
          location.pathname
        ),
      [location.pathname]
    );

    const handleAssignSignSeatSuccess = (memberName: string, additionalQuantity: number) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: (
          <Trans
            i18nKey="memberPage.luminSignSeat.assignSeatSuccessAfterPurchase"
            values={{
              memberName,
              additionalQuantity,
              count: additionalQuantity,
            }}
            components={{ strong: <b className="kiwi-message--primary" /> }}
          />
        ),
      });

      window.dispatchEvent(
        new CustomEvent(CUSTOM_EVENT.REFETCH_ORG_MEMBER, {
          detail: {
            organizationId,
          },
        })
      );

      closeModal();
    };

    const contextValue = useMemo(
      () => ({
        openOneClickUpgradeModal: openModal,
        skipNextNotification,
      }),
      [openModal, skipNextNotification]
    );

    if (!isEligibleRoute) {
      return <WrappedComponent {...props} />;
    }

    return (
      <OneClickUpgradeContext.Provider value={contextValue}>
        <>
          <WrappedComponent {...props} />
          {selectedMember && (
            <SignSeatModalComponent
              opened
              organizationId={organizationId}
              assignedMember={selectedMember}
              onClose={closeModal}
              onUpgradeSuccess={handleAssignSignSeatSuccess}
            />
          )}
        </>
      </OneClickUpgradeContext.Provider>
    );
  };

  WithOneClickUpgradeComponent.displayName = `withOneClickUpgrade(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithOneClickUpgradeComponent as ComponentType<P>;
}
