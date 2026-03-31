import { Trans } from 'next-i18next';

import { Text } from '@/ui';

import * as Styled from './SsoSignInBanner.styled';

const SsoSignInBanner = () => {
  return (
    <Styled.Container>
      <Styled.LeftSection>
        <Text level={2}>👋</Text>
      </Styled.LeftSection>
      <div>
        <Text level={5}>
          <Trans i18nKey='sso.ssoSignInBannerContent' values={{ ssoIdp: 'SSO IdP' }} components={{ b: <b /> }} />
        </Text>
      </div>
    </Styled.Container>
  );
};

export default SsoSignInBanner;
