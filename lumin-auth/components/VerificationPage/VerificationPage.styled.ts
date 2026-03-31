import { css } from '@emotion/react';

import { Colors, mediaQueryUp } from '@/ui';

export const verifyContainerCss = css`
  display: flex;
  flex-direction: column;
`;

export const verificationFailTitleCss = css`
  margin-bottom: 8px;
  ${mediaQueryUp.md} {
    margin-bottom: 16px;
  }
`;

export const verificationTitleCss = css`
  margin-bottom: 8px;
  ${mediaQueryUp.md} {
    margin-bottom: 16px;
  }
`;

export const verificationMessageCss = css`
  margin: 0 0 24px;
  ${mediaQueryUp.md} {
    margin: 0 -16px 24px;
  }
`;

export const verificationMessageHasErrorCss = css`
  margin: 0 0 16px;
  ${mediaQueryUp.md} {
    margin: 0 -16px 16px;
  }
`;

export const dividerCss = css`
  height: 1px;
  width: 144px;
  background-color: ${Colors.NEUTRAL_20};
`;

export const breaklineCss = css`
  ${mediaQueryUp.md} {
    display: none;
  }
`;

export const resendMessageCss = css`
  color: ${Colors.SECONDARY_50};
  ${mediaQueryUp.md} {
    margin-left: 8px;
  }
`;

export const verifySuccessCss = css`
  margin-bottom: 24px;
`;

export const countdownCss = css`
  pointer-events: none;
  opacity: 0.5;
`;

export const questionTextCss = css`
  margin-top: 24px;
`;

export const buttonCss = css`
  margin-top: 24px;
  width: 100%;
`;
