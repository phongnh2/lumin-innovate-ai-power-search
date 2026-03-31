import styled from 'styled-components';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';
import Select from 'lumin-components/GeneralLayout/general-components/Select';

import { spacings, typographies } from 'constants/styles/editor';

export const BaseWrapper = styled.div`
  margin-bottom: ${spacings.le_gap_2}px;
`;

export const EditPdfStyleWrapper = styled(BaseWrapper)`
  position: relative;
  padding: var(--kiwi-spacing-1) var(--kiwi-spacing-2);
  &::after {
    position: absolute;
    content: '';
    bottom: -1px;
    left: 16px;
    right: 16px;
    height: 1px;
    ${({ theme }) => `
      background-color: ${theme.le_main_outline_variant}
    `}
  }
`;
export const SubTitle = styled.div`
  ${{ ...typographies.le_title_small }};
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
  `}
  margin-bottom: ${spacings.le_gap_1}px;
`;

export const ContentWrapper = styled.div`
  display: flex;
  gap: ${spacings.le_gap_1}px;
  flex-direction: column;
`;

export const FontStyleWrapper = styled.div`
  display: flex;
  gap: ${spacings.le_gap_1}px;
`;

export const FontSizeSelect = styled(Select)`
  width: 100%;
`;

export const EditPdfColorWrapper = styled(BaseWrapper)`
  padding: 0 16px;
  margin-top: ${spacings.le_gap_2}px;
`;

export const PopoverWrapper = styled.div`
  ${({ theme }) => `
    background-color: ${theme.le_information_information_container};
  `}
  margin: 0 8px;
  padding: 8px;
  border-radius: var(--border-radius-primary);
  position: relative;
`;

export const PopoverTitle = styled.p`
  ${{ ...typographies.le_title_medium }};
  ${({ theme }) => `
    color: ${theme.le_information_on_information_container};
  `}
  margin-bottom: 6px;
`;

export const CloseButton = styled(IconButton)`
  position: absolute;
  top: 2px;
  right: 2px;
`;

export const StyledList = styled.ul`
  list-style: outside;
  padding-left: 16px;
  color: var(--kiwi-colors-core-secondary);

  & li {
    ${{ ...typographies.le_body_small }};
  }
`;
