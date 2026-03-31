import MenuV1 from '@mui/material/MenuList';
import { MenuItemBase } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import MenuV2 from '@new-ui/general-components/Menu';

import MenuItemV1 from 'lumin-components/Shared/MenuItem';

import { useTranslation } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { HELP_CENTER_URL } from 'constants/customConstant';
import { AUTH_SERVICE_URL, CANNY_FEEDBACK_REDIRECT_URL, STATIC_PAGE_URL } from 'constants/urls';

import * as Styled from '../NavigationBar.styled';

const HelpCenterPopper = ({ closePopper }) => {
  const { t } = useTranslation();
  const { isViewer } = useViewerMatch();

  const shouldUseNewComponent = isViewer;

  const MenuComponent = useMemo(() => (shouldUseNewComponent ? MenuV2 : MenuV1), [shouldUseNewComponent]);

  const MenuItemComponent = useMemo(() => (shouldUseNewComponent ? MenuItemBase : MenuItemV1), [shouldUseNewComponent]);

  return (
    <MenuComponent {...(!shouldUseNewComponent && { disablePadding: true })}>
      <Styled.LinkItem
        $isNewLayout={shouldUseNewComponent}
        href={HELP_CENTER_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={closePopper}
      >
        <MenuItemComponent
          {...(shouldUseNewComponent && {
            size: 'dense',
          })}
        >
          {t('common.helpCenter')}
        </MenuItemComponent>
      </Styled.LinkItem>
      <Styled.LinkItem
        $isNewLayout={shouldUseNewComponent}
        href={STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSupport'))}
        target="_blank"
        rel="noopener noreferrer"
        onClick={closePopper}
      >
        <MenuItemComponent
          {...(shouldUseNewComponent && {
            size: 'dense',
          })}
        >
          {t('common.contactSupport')}
        </MenuItemComponent>
      </Styled.LinkItem>
      <Styled.LinkItem
        $isNewLayout={shouldUseNewComponent}
        href={`${AUTH_SERVICE_URL}/authentication/canny?redirect=${CANNY_FEEDBACK_REDIRECT_URL}`}
        target="_blank"
        rel="noopener noreferrer"
        data-lumin-btn-name={ButtonName.GIVE_FEEDBACK}
        onClick={closePopper}
      >
        <MenuItemComponent
          {...(shouldUseNewComponent && {
            size: 'dense',
          })}
        >
          {t('common.giveFeedback')}
        </MenuItemComponent>
      </Styled.LinkItem>
    </MenuComponent>
  );
};

HelpCenterPopper.propTypes = {
  closePopper: PropTypes.func.isRequired,
};

export default HelpCenterPopper;
