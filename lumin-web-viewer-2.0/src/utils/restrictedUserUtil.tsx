import { capitalize } from 'lodash';
import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { AnyAction } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import commonUtils from 'utils/common';

import { FileService, InviteScope } from 'constants/domainRules.enum';
import { ModalTypes } from 'constants/lumin-common';

import { store } from '../redux/store';

const getUserDomain = (email: string): string => commonUtils.getDomainFromEmail(email);

export const getTenantConfigForUser = (email: string) => {
  if (!email) {
    return null;
  }
  const state = store.getState();
  const user = selectors.getCurrentUser(state);
  const domain = getUserDomain(email);
  return user?.allTenantConfigurations?.find((tenant) => tenant.domain === domain) || null;
};

export const getDriveUserRestrictedDomain = (): string[] => {
  const state = store.getState();
  const user = selectors.getCurrentUser(state);

  return (
    user?.allTenantConfigurations
      ?.filter((t) => t.configuration?.files?.service === FileService.ONLY_DRIVE)
      .map((t) => t.domain) || []
  );
};

export const isDriveOnlyUser = (email: string): boolean => {
  const tenant = getTenantConfigForUser(email);
  return tenant?.configuration?.files?.service === FileService.ONLY_DRIVE;
};

export const isInviteScopeInternalOnly = (email: string): boolean => {
  const tenant = getTenantConfigForUser(email);
  return tenant?.configuration?.collaboration?.inviteScope === InviteScope.INTERNAL_ONLY;
};

export const isOrgCreationRestricted = (email: string): boolean => {
  const tenant = getTenantConfigForUser(email);
  return !(tenant?.configuration?.organization?.allowOrgCreation ?? true);
};

export const getDriveUserRestrictedEmail = (email: string): string => {
  if (isDriveOnlyUser(email)) {
    return email;
  }
  return '';
};

export const isHideAiChatbot = (email: string): boolean => {
  const tenant = getTenantConfigForUser(email);
  return Boolean(tenant?.configuration?.ui?.hideAiChatbot ?? false);
};

export const isHidePromptDriveUsersBanner = (email: string): boolean => {
  const tenant = getTenantConfigForUser(email);
  return Boolean(tenant?.configuration?.ui?.hidePromptDriveUsersBanner ?? false);
};

export const getDomainInfos = (domain: string) => ({
  name: capitalize(domain.split('.')[0]),
});

type ModalMessageProps = {
  restrictedEmail: string;
  restrictedDomain: string;
};

export const getMessage = ({ restrictedEmail, restrictedDomain }: ModalMessageProps): JSX.Element => {
  if (restrictedEmail) {
    return (
      <>
        Your account must be authorized with{' '}
        <Text color="var(--kiwi-colors-core-primary)" component="span">
          {restrictedEmail}
        </Text>{' '}
        Google account.
      </>
    );
  }

  const { name } = getDomainInfos(restrictedDomain);

  return (
    <>
      Only users having{' '}
      <Text color="var(--kiwi-colors-surface-on-surface)" bold>
        {restrictedDomain}
      </Text>{' '}
      domain are able to authorize with{' '}
      <Text color="var(--kiwi-colors-surface-on-surface)" bold>
        {name}
      </Text>{' '}
      Google Drive account.
    </>
  );
};

type OpenCannotAuthorizeModalProps = {
  restrictedEmail: string;
  onConfirm: () => void;
  restrictedDomain: string;
};

export const openCannotAuthorizeModal = ({
  restrictedEmail,
  onConfirm,
  restrictedDomain,
}: OpenCannotAuthorizeModalProps): void => {
  const state = store.getState();
  const isLoadingModalOpen = selectors.isElementOpen(state, 'loadingModal');

  if (isLoadingModalOpen) {
    store.dispatch(actions.closeElement('loadingModal') as AnyAction);
  }

  store.dispatch(
    actions.openModal({
      type: ModalTypes.WARNING,
      title: 'Cannot authorize with this account',
      confirmButtonTitle: 'Reauthorize',
      useReskinModal: true,
      message: getMessage({ restrictedEmail, restrictedDomain }),
      onConfirm: () => {
        if (isLoadingModalOpen) {
          store.dispatch(actions.openElement('loadingModal') as AnyAction);
        }
        onConfirm();
      },
    }) as AnyAction
  );
};
