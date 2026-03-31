import { Button, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import SignInSlackDark from 'assets/reskin/images/sign-in-slack-dark.png';
import SignInSlackLight from 'assets/reskin/images/sign-in-slack-light.png';

import { useGetCurrentUser, useThemeMode, useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { THEME_MODE } from 'constants/lumin-common';

import { useAuthorize } from '../hooks/useAuthorize';
import styles from '../ShareInSlackModal.module.scss';

const SignInWithSlack = () => {
  const { t } = useTranslation();
  const themeMode = useThemeMode();
  const isLightMode = themeMode === THEME_MODE.LIGHT;
  const currentUser = useGetCurrentUser() || { email: '' };

  const { handleAuthorize } = useAuthorize();

  return (
    <div className={styles.signInWithSlackContainer}>
      <img
        src={isLightMode ? SignInSlackLight : SignInSlackDark}
        alt="Sign in with Slack"
        className={styles.signInWithSlackImage}
      />
      <Text type="body" size="lg">
        <Trans
          i18nKey="shareInSlack.pleaseSignIn"
          components={{ b: <b style={{ fontWeight: '700' }} /> }}
          values={{ email: currentUser.email }}
        />
      </Text>
      <Button
        variant="outlined"
        size="lg"
        classNames={{ root: styles.signInWithSlackButton }}
        onClick={handleAuthorize}
        data-lumin-btn-name={ButtonName.SHARE_IN_SLACK_AUTHORIZE}
      >
        {t('common.authorize')}
      </Button>
    </div>
  );
};

export default SignInWithSlack;
