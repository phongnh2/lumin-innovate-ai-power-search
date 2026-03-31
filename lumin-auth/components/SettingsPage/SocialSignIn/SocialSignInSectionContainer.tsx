import { ReactNode } from 'react';

import { VerticalBar } from '@/ui';

import { highlightAnimationCss, sectionContainerCss } from './SocialSignIn.styled';

export const SocialSignInSectionContainer = ({ children, highlight }: { children: ReactNode; highlight?: boolean }) => {
  return (
    <div css={sectionContainerCss}>
      <div css={highlight && highlightAnimationCss} />
      <VerticalBar />
      {children}
      <VerticalBar />
    </div>
  );
};
