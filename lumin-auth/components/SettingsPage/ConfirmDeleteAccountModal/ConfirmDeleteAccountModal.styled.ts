import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Image from 'next/image';

import { mediaQuery } from '@/lib/emotion/mediaQuery';
import { Colors } from '@/ui';
import CustomScrollbar from '@/ui/CustomScrollbar';
import { Fonts } from '@/ui/utils/font.enum';

export const containerCss = css`
  width: 100%;
  max-width: 328px;
  box-sizing: border-box;
  ${mediaQuery.md`
    max-width: 400px;
  `}
`;
export const headerCss = css`
  display: flex;
  flex-direction: column;
`;
export const iconContainerCss = css`
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  ${mediaQuery.md`
    margin-bottom: 16px;
  `}
`;
export const titleCss = css`
  font-family: ${Fonts.Primary};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};
  margin-left: 16px;
`;
export const descriptionCss = css`
  font-family: ${Fonts.Primary};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  margin-bottom: 16px;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;
export const listContainerCss = css``;

export const teamItemCss = css`
  padding: '8px 0';
  margin-bottom: '2px';
`;

export const orgItemCss = css`
  padding: '6px 0';
  margin-bottom: '4px';
`;

export const listItemCss = css`
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  & > div:first-of-type {
    flex-shrink: 0;
  }
`;
export const linkCss = css`
  display: block;
  font-family: ${Fonts.Primary};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  text-decoration-line: underline;
  margin-left: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
export const orgNameCss = css`
  font-family: ${Fonts.Primary};
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
  margin-left: 12px;
  margin-top: 4px;
`;

export const tabsCss = css`
  display: flex;
  border-bottom: 1px solid ${Colors.NEUTRAL_20};
`;

export const tabCss = css`
  width: 50%;
  padding: 10px 0;
  cursor: pointer;
`;

export const activeTabCss = css`
  border-bottom: 2px solid ${Colors.NEUTRAL_100};
`;

export const labelCss = css`
  font-family: ${Fonts.Primary};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_60};
  text-align: center;
`;

export const activeLabelCss = css`
  color: ${Colors.NEUTRAL_100};
`;
export const buttonWrapperCss = css`
  width: 100%;
  border-top: 1px solid ${Colors.NEUTRAL_20};

  button {
    width: 100%;
    padding: 10px;
  }
`;
export const CustomScrollbars = styled(CustomScrollbar)`
  div {
    overflow: hidden;
  }

  div > li:first-of-type {
    margin-top: 8px;
  }
`;

export const avatarContainerCss = css`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${Colors.NEUTRAL_20};
`;

export const Avatar = styled(Image)`
  width: 32px;
  height: 32px;
`;

export const footerCss = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  margin-top: 16px;
`;

export const disableTabCss = css`
  pointer-events: none;
`;

export const disableLabelCss = css`
  color: ${Colors.NEUTRAL_60};
`;
