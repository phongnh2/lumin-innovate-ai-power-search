import styled from 'styled-components';
import { spacings, typographies } from 'constants/styles/editor';
import { IWrapperProps } from './InlineAlert.interface';

export const Wrapper = styled.div<IWrapperProps>`
  border-radius: 8px;
  box-shadow: 0px 12px 12px -7px rgba(0, 0, 0, 0.04), 0px 28px 23px -7px rgba(0, 0, 0, 0.05),
    0px 1px 3px 0px rgba(0, 0, 0, 0.05);
  background-color: ${({ $bgColor, theme }) => theme[$bgColor]};
  color: ${({ $color, theme }) => {
    return theme[$color];
  }};
  padding: ${spacings.le_gap_1_5}px ${spacings.le_gap_2}px;
  display: flex;
  gap: ${spacings.le_gap_2}px;
  max-width: 900px;
  width: 100%;
`;

export const MainContentWrapper = styled.div`
  display: flex;
  gap: ${spacings.le_gap_1}px;
  min-width: 0;
  word-break: break-word;
  flex-grow: 1;
`;

export const Title = styled.h2`
  ${{ ...typographies.le_title_small }};
  display: flex;
  align-items: center;
`;

export const TailWrapper = styled.div`
  flex-shrink: 0;
  display: flex;
`;

export const IconWrapper = styled.div`
  margin-top: 4px;
`;