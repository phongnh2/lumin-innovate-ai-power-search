import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { Colors, mediaQueryUp } from '@/ui';
import { textSizeMap } from '@/ui/Text/utils';

export const titleCss = css`
  ${textSizeMap.getCss(5)};
  ${mediaQueryUp.md} {
    ${textSizeMap.getCss(3)};
  }
`;

export const nameInputLabelCss = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '4px'
});

export const nameSubmitButtonGroupCss = css({
  display: 'grid',
  gap: '16px',
  gridTemplateColumns: '1fr 1fr',
  marginTop: '16px'
});

export const formCss = css({
  marginTop: '16px'
});

export const sectionCss = css`
  max-width: var(--page-container-md);
  margin: 0 auto;
  padding-top: 24px;
  ${mediaQueryUp.md} {
    padding-top: 40px;
  }
`;

export const profileAvatarCss = css`
  margin-bottom: 32px;
`;

export const emailContainerCss = css`
  display: flex;
  align-items: center;
`;

export const verticalBarCss = css`
  margin: 24px 0;
`;

export const messageCss = css`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
`;

export const reactivateMessageContainerCss = css`
  display: flex;
  align-items: center;
  margin-top: 16px;
`;

export const deleteAccountDescCss = css`
  ${textSizeMap.getCss(6)};
  margin-top: 16px;
  ${mediaQueryUp.md} {
    ${textSizeMap.getCss(5)};
  }
`;

export const changeNameButtonCss = styled.div`
  display: inline-flex;
`;

export const ssoSignInBannerWrapperCss = css`
  margin-bottom: 16px;

  ${mediaQueryUp.md} {
    margin-bottom: 32px;
  }
`;
