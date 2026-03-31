import { Menu, MenuItem, PlainTooltip, Icomoon, IconButton } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useTranslation } from 'hooks';
import { useNetworkStatus } from 'hooks/useNetworkStatus';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { HELP_CENTER_URL } from 'constants/customConstant';
import { AUTH_SERVICE_URL, CANNY_FEEDBACK_REDIRECT_URL, STATIC_PAGE_URL } from 'constants/urls';

import styles from './HelpCenterButton.module.scss';

const HelpCenterButton = () => {
  const { t } = useTranslation();

  const { isOffline } = useNetworkStatus();

  const [opened, setOpened] = useState(false);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      const linkElement = e.currentTarget.querySelector('a');
      linkElement?.click();
    }
  };

  return (
    <Menu
      width="fit-content"
      ComponentTarget={
        <PlainTooltip disabled={opened} content={t('common.helpCenter')} position="bottom">
          <IconButton
            size="lg"
            activated={opened}
            disabled={isOffline}
            icon={<Icomoon type="help-md" size="lg" color="var(--kiwi-colors-surface-on-surface)" />}
          />
        </PlainTooltip>
      }
      position="bottom-end"
      opened={opened}
      onChange={setOpened}
    >
      <MenuItem onKeyDown={onKeyDown}>
        <Link tabIndex={-1} className={styles.link} to={HELP_CENTER_URL} target="_blank" rel="noopener noreferrer">
          {t('common.helpCenter')}
        </Link>
      </MenuItem>
      <MenuItem onKeyDown={onKeyDown}>
        <Link
          tabIndex={-1}
          className={styles.link}
          to={`${STATIC_PAGE_URL}${getFullPathWithPresetLang(t('url.saleSupport.contactSupport'))}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('common.contactSupport')}
        </Link>
      </MenuItem>
      <MenuItem onKeyDown={onKeyDown} data-lumin-btn-name={ButtonName.GIVE_FEEDBACK}>
        <Link
          tabIndex={-1}
          className={styles.link}
          to={`${AUTH_SERVICE_URL}/authentication/canny?redirect=${CANNY_FEEDBACK_REDIRECT_URL}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('common.giveFeedback')}
        </Link>
      </MenuItem>
    </Menu>
  );
};

export default HelpCenterButton;
