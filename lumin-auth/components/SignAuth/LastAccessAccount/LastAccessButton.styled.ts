import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { Button, Text } from '@/ui';
import { textSizeMap } from '@/ui/Text/utils';
import { Colors } from '@/ui/theme/color';

export const containerCss = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const LastAccessChildrenWrapper = styled('div')`
  display: flex;
  justify-content: left;
  text-align: left;
  transition: transform ease-in-out 200ms;
  width: calc(100% - 28px);
`;

export const RemoveButton = styled('span')`
  width: 28px;
  height: 28px;
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  pointer-event: none;
  transition: opacity ease-in-out 200ms;
  flex-shrink: 0;
  z-index: 1;
`;

export const LastAccessButton = styled(Button)`
  && {
    border-color: #dadce0;
    border-radius: 8px;
    padding: 10px 16px;
    height: 60px;
    justify-content: left;
    text-align: left;
  }
  &:disabled {
    background: ${Colors.NEUTRAL_10} !important;
  }
  &:hover ${LastAccessChildrenWrapper} {
    transform: translateX(28px);
  }
  &:hover ${RemoveButton} {
    opacity: 1;
    pointer-event: auto;
  }
`;

export const logoContainerCss = css`
  width: 40px;
  height: 40px;
  position: absolute;
  background: white;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const plusIconContainerCss = css`
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${Colors.NEUTRAL_10};
  border-radius: 100%;
  margin-right: 8px;
`;

export const avatarCss = css`
  margin-right: 8px;
`;

export const subTextCss = css`
  ${textSizeMap.getCss(6)}
  font-weight: 400;
  color: ${Colors.NEUTRAL_70};
`;

export const dividerCss = css`
  background: ${Colors.NEUTRAL_20};
  width: 100%;
  height: 1px;
  margin-bottom: 24px;
`;

export const textDividerCss = css`
  border-color: ${Colors.NEUTRAL_20};
  font-weight: 400;
  margin: 24px 0px;
  text-transform: uppercase;
  font-size: 14px;
  line-height: 16px;
  font-weight: 600;
  & span {
    padding: 0px;
    color: ${Colors.NEUTRAL_60};
  }
  &::before,
  &::after {
    border-top: 1px solid ${Colors.NEUTRAL_20};
  }
  gap: 24px;
`;

export const BackToSaveProfileButton = styled(Text)`
  width: 100%;
  text-align: center;
  font-weight: bold;
`;

export const alertCss = css`
  margin-bottom: 16px;
`;

export const emailTextCss = css`
  display: flex;
  width: 100%;
  overflow: hidden;
  align-items: center;

  & > :first-child {
    text-overflow: ellipsis;
    flex-shrink: 0;
    overflow: hidden;
    position: relative;
    max-width: 60%;
  }

  & > :last-child {
    text-overflow: ellipsis;
    overflow: hidden;
    padding-right: 14px;
  }
`;

export const emailTextContainerCss = css`
  overflow: hidden;
`;
