import { useEffect, useState } from 'react';

import { Identity } from '@/interfaces/ory';

import { SOCIAL_SIGN_IN_PROVIDER_TO_LOGIN_SERVICE, SocialSignInProvider } from './constant';
import { useHighLightProvider, useSocialSignInQuery } from './hooks';
import RequestEnableSocialSignIn from './RequestEnableSocialSignIn';
import SocialSignIn from './SocialSignIn';
import { SocialSignInSectionContainer } from './SocialSignInSectionContainer';
import { Title } from './Title';

export default function SocialSignInSection({ identity, onError }: { identity: Identity; onError?: (error: unknown) => void }) {
  const { hightlightProvider, setHighlightProvider } = useHighLightProvider(identity.traits.email);
  const [visibleProviders, setVisibleProviders] = useState<SocialSignInProvider[]>([]);
  const { query } = useSocialSignInQuery();

  useEffect(() => {
    if (hightlightProvider) {
      setVisibleProviders([hightlightProvider]);
      return;
    }
    if (query.requestEnableSocialSignIn) {
      setVisibleProviders([query.provider]);
      return;
    }
    setVisibleProviders(
      Object.values(SocialSignInProvider).filter(provider => SOCIAL_SIGN_IN_PROVIDER_TO_LOGIN_SERVICE[provider] !== identity.traits.loginService)
    );
  }, [hightlightProvider, query.requestEnableSocialSignIn]);

  return (
    <SocialSignInSectionContainer highlight={Boolean(hightlightProvider)}>
      <Title />
      {visibleProviders.map(provider => (
        <SocialSignIn identity={identity} provider={provider} key={provider} onError={onError} />
      ))}
      <RequestEnableSocialSignIn onConfirm={setHighlightProvider} />
    </SocialSignInSectionContainer>
  );
}
