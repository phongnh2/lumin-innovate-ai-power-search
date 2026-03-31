import { ButtonColorType } from 'lumin-ui/kiwi-ui';
import styled, { css } from 'styled-components';

import { mediaQueryDown } from 'utils/styles/mediaQuery';

import { typographies, spacings } from 'constants/styles/editor';

type BannerProps = {
  type: ButtonColorType;
};

export const BannerWrapper = styled.div<BannerProps>`
  width: 100%;
  transition: all 0.3s ease;
  position: relative;
  background-color: ${({ type, theme }) => {
    switch (type) {
      case ButtonColorType.warning:
        return theme.le_warning_warning_container;
      case ButtonColorType.info:
      default:
        return theme.le_information_information_container;
    }
  }};
  border-radius: inherit;
  z-index: 79;
`;

export const BannerInner = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  padding: ${spacings.le_gap_1}px ${spacings.le_gap_0_5}px;
  align-items: center;
  overflow: hidden;
  box-sizing: border-box;
  transition: background-color 0.3s ease;
  gap: ${spacings.le_gap_2}px;

  ${mediaQueryDown.lg`
    padding: ${spacings.le_gap_3}px;
  `}

  ${mediaQueryDown.sm`
    padding: ${spacings.le_gap_2}px;
  `}
`;

export const BannerContent = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: ${spacings.le_gap_2}px;

  .revision-banner-btn-disabled {
    display: none;
  }

  ${mediaQueryDown.lg`
    padding-right: ${spacings.le_gap_4}px;
    gap: ${spacings.le_gap_1_5}px;
  `}

  ${mediaQueryDown.sm`
    flex-direction: column;
    gap: ${spacings.le_gap_2}px;
    padding-right: 0;
  `}
`;

const MessageTextColor = css<BannerProps>`
  color: ${({ theme, type }) => {
    switch (type) {
      case ButtonColorType.warning:
        return theme.le_main_on_surface;
      case ButtonColorType.info:
      default:
        return theme.le_information_on_information_container;
    }
  }};
`;

export const BannerMessage = styled.div<BannerProps>`
  ${{ ...typographies.le_title_small }}
  display: flex;
  align-items: center;
  ${MessageTextColor}
  & a {
    text-decoration: underline;
    color: ${({ theme }) => theme.le_main_primary};

    &:hover,
    &:visited {
      ${MessageTextColor}
    }
  }

  ${mediaQueryDown.sm`
    padding-right: ${spacings.le_gap_3}px;
  `}
`;

export const BannerCloseIcon = styled.div`
  ${mediaQueryDown.lg`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: ${spacings.le_gap_1}px;
  `}

  ${mediaQueryDown.sm`
    position: absolute;
    top: ${spacings.le_gap_1}px;
    right: ${spacings.le_gap_1}px;
    transform: none;
  `}
`;

export const BannerStatusIconWrapper = styled.span`
  display: flex;
  align-items: center;
  margin-right: ${spacings.le_gap_1}px;
`;
