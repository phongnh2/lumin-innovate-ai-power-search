import styled from 'styled-components';

import { CenterContainer } from 'luminComponents/Shared/shared.styled';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { BorderRadius, Colors, Fonts } from 'constants/styles';

export const BannerContainer = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 99;
`;

export const BannerWrapper = styled(CenterContainer)<{ $isLoading?: boolean }>`
  width: 100%;
  height: 100%;
  padding: 8px 16px;
  justify-content: space-between;
  background-color: ${Colors.OTHER_22};
  gap: 16px;
  ${({ $isLoading }) => $isLoading && `
    background-color: ${Colors.NEUTRAL_5};
  `}
`;

export const IconWrapper = styled(CenterContainer)`
  min-width: 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  background-color: ${Colors.NEUTRAL_0};
`;

export const BannerContent = styled.h6`
  color: ${Colors.NEUTRAL_100};
  padding-right: 16px;
  font-weight: 375;
  line-height: 20px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  ${mediaQuery.xl`
    word-break: break-word;
    white-space: nowrap;
    display: grid;
    grid-template-columns: max-content 1fr max-content;
  `}
  b {
    font-weight: 600;
    ${mediaQuery.xl`
      margin: 0 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `}
  }
`;

export const PreviewBtn = styled.button`
  cursor: pointer;
  padding: 0 16px;
  height: 32px;
  min-width: 80px;
  white-space: nowrap;
  border: 1px solid ${Colors.NEUTRAL_100};
  border-radius: ${BorderRadius.PRIMARY};
  line-height: 16px;
  font-family: ${Fonts.PRIMARY};
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: ${Colors.NEUTRAL_100};
  background-color: ${Colors.NEUTRAL_0};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
