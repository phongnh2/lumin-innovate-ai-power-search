import { Divider, Icomoon, IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useDesktopMatch, useDocumentsRouteMatch, useGetCurrentOrganization, useMobileMatch } from 'hooks';

import { organizationServices } from 'services';

import { WebChatbotButton } from 'features/WebChatBot/components';

import { InviteUsersSetting } from 'constants/organization.enum';

import { InviteMembersButton } from '../InviteMembersButton';

const ButtonGroup = ({
  openSearchView,
  isEnabledWebChatbot,
}: {
  openSearchView: () => void;
  isEnabledWebChatbot: boolean;
}) => {
  const currentOrganization = useGetCurrentOrganization();
  const isManager = organizationServices.isManager(currentOrganization?.userRole);
  const isDesktopMatch = useDesktopMatch();
  const isInDocumentPage = useDocumentsRouteMatch();
  const isMobile = useMobileMatch();

  const showInviteButton =
    isDesktopMatch &&
    currentOrganization &&
    (isManager || currentOrganization?.settings?.inviteUsersSetting === InviteUsersSetting.ANYONE_CAN_INVITE);

  const showSearchButton = !isDesktopMatch;
  return (
    <>
      {showInviteButton && <InviteMembersButton />}
      {showSearchButton && (
        <IconButton
          size="lg"
          icon={<Icomoon type="search-lg" size="lg" color="var(--kiwi-colors-surface-on-surface)" />}
          onClick={openSearchView}
        />
      )}
      {isEnabledWebChatbot && (!isInDocumentPage || isMobile) && <WebChatbotButton />}
      {(showInviteButton || showSearchButton || isEnabledWebChatbot) && (!isInDocumentPage || isMobile) && (
        <Divider style={{ alignSelf: 'center' }} h="var(--kiwi-spacing-3)" orientation="vertical" />
      )}
    </>
  );
};

export default ButtonGroup;
