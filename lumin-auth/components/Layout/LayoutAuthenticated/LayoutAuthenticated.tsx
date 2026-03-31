import { ReactElement } from 'react';
import { shallowEqual } from 'react-redux';

import { AuthenticatedHeader } from '@/components/Header';
import NewPrivacyPolicyModal from '@/components/NewPrivacyPolicyModal';
import useGetTopBannerHeight from '@/hooks/useGetTopBannerHeight';
import { useAppSelector } from '@/lib/hooks';
import { getIdentity } from '@/selectors';

import { mainCss } from './LayoutAuthenticated.styled';

interface ILayoutAuthenticatedProps {
  children: ReactElement;
}

const LayoutAuthenticated = ({ children }: ILayoutAuthenticatedProps) => {
  const identity = useAppSelector(getIdentity, shallowEqual);
  const { topBannerHeight } = useGetTopBannerHeight('new-privacy-policy-banner');

  if (!identity) {
    return null;
  }

  return (
    <>
      <NewPrivacyPolicyModal />
      <AuthenticatedHeader heading='Account' topBannerHeight={topBannerHeight} />
      <main
        css={mainCss}
        style={{
          padding: `calc(var(--header-height) + ${topBannerHeight}px) 16px 32px`
        }}
      >
        {children}
      </main>
    </>
  );
};

export default LayoutAuthenticated;
