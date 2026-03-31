import { css } from '@emotion/react';
import { Trans } from 'react-i18next';
import { shallowEqual } from 'react-redux';

import { LoginService } from '@/interfaces/user';
import { useAppSelector } from '@/lib/hooks';
import { getIdentity } from '@/selectors';
import { Colors, Icomoon, Text, Tooltip } from '@/ui';

import { titleCss } from '../Settings.styled';

import { LOGIN_SERVICE_TO_SOCIAL_SIGN_IN_PROVIDER } from './constant';

export const Title = () => {
  const identity = useAppSelector(getIdentity, shallowEqual);
  const loginService = LOGIN_SERVICE_TO_SOCIAL_SIGN_IN_PROVIDER[identity?.traits.loginService as LoginService];
  return (
    <Text
      as='h2'
      bold
      css={[
        titleCss,
        css`
          display: flex;
          align-items: center;
          margin-top: 24px;
          gap: 10px;
        `
      ]}
    >
      <Trans i18nKey='socialSignIn.signInMethod' />
      <Tooltip title={<Trans i18nKey='socialSignIn.signInMethodTooltip' values={{ method: loginService }} />}>
        <div>
          <Icomoon type='info' size={18} color={Colors.NEUTRAL_80} />
        </div>
      </Tooltip>
    </Text>
  );
};
