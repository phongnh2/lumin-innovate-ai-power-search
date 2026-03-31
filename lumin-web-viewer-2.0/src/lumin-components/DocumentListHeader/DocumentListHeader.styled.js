import styled, { css } from 'styled-components';

import {
  LAST_OPENED_CELL_WIDTH,
  STORAGE_CELL_WIDTH,
} from 'lumin-components/DocumentItem/components/DocumentListItem/DocumentListItem.styled';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors } from 'constants/styles';

const getDisplay = (display) => css`display: ${({ $isEmpty }) => ($isEmpty ? 'none' : display)};`;

export const Container = styled.div`
  ${getDisplay('flex')};
  display: ${({ $isEmpty }) => ($isEmpty ? 'none' : 'flex')};
  align-items: center;
  justify-content: space-between;
  padding-bottom: ${({ $isGridLayout }) => ($isGridLayout ? 16 : 12)}px;
  ${mediaQuery.md`
    ${getDisplay('grid')};
    padding-bottom: 12px;
    height: 44px;
    grid-template-columns: 4fr 1fr ${STORAGE_CELL_WIDTH} ${LAST_OPENED_CELL_WIDTH} 40px;
    column-gap: 32px;
    ${(props) =>
      props.$isSelecting &&
      `
      display: none;
    `}
  `}
`;
export const ContainerReskin = styled.div`
  ${getDisplay('flex')};
  display: ${({ $isEmpty }) => ($isEmpty ? 'none' : 'flex')};
  align-items: center;
  justify-content: space-between;
  padding: var(--kiwi-spacing-1-5) 0;
  height: 48px;
  ${(props) =>
    props.$isSelecting &&
    `
    display: none;
  `}
  ${mediaQuery.md`
    ${getDisplay('grid')};
    grid-template-columns: ${(props) =>
      props.$isPersonalDocumentsRoute ? '1fr 86px 120px 32px' : '1fr 120px 86px 120px 32px'};
    column-gap: var(--kiwi-spacing-0-5);
    ${(props) =>
      props.$isSelecting &&
      `
      display: none;
    `}
  `}
  ${mediaQuery.xl`
    ${getDisplay('grid')};
    grid-template-columns: ${(props) =>
        props.$isPersonalDocumentsRoute
          ? '1fr 150px 130px 32px'
          : '1fr 180px 150px 130px 32px'};
    column-gap: var(--kiwi-spacing-0-5);
    ${(props) =>
      props.$isSelecting &&
      `
      display: none;
    `}
  `}
`;
export const Title = styled.p`
  font-size: 12px;
  line-height: 1.33;
  font-weight: 600;
  color: ${Colors.NEUTRAL_80};
  text-transform: uppercase;
  display: inline-block;
  margin: 0;
`;
export const TitleReskin = styled.p.attrs({ className: 'kiwi-typography-body-md' })`
  white-space: nowrap;
  display: inline-block;
  margin: 0;
  color: var(--kiwi-colors-surface-on-surface-variant);
`;
export const TitleTablet = styled(Title)`
  display: none;
  ${mediaQuery.md`
    display: ${({ $display }) => ($display ? 'block' : 'none')};
  `}
`;
export const TitleTabletReskin = styled(TitleReskin)`
  display: none;
  ${mediaQuery.md`
    display: ${({ $display }) => ($display ? 'block' : 'none')};
  `}
`;
export const UploadedTitle = styled(Title)`
  display: block;
  ${mediaQuery.md`
    display: none;
  `}
  ${mediaQuery.xl`
    display: block;
  `}
`;
export const UploadedTitleReskin = styled(TitleReskin)`
  display: block;
  ${mediaQuery.md`
    display: none;
  `}
  ${mediaQuery.xl`
    display: block;
  `}
`;
export const DisplayTablet = styled.div`
  display: none;
  ${mediaQuery.md`
    display: block;
  `}
  ${mediaQuery.xl`
    display: none;
  `}
`;
export const OwnerTitle = styled(Title)`
  display: none;
  ${mediaQuery.md`
    display: flex;
    align-items: center;
    ${({ $filterable }) =>
      $filterable &&
      `
      cursor: pointer;
    `}
  `}
`;
export const OwnerTitleReskin = styled(TitleReskin)`
  display: none;
  ${mediaQuery.md`
    display: flex;
    align-items: center;
    ${({ $filterable }) =>
      $filterable &&
      `
      cursor: pointer;
    `}
  `}
  color: var(--kiwi-colors-surface-on-surface-variant);
`;
export const SelectDocument = styled.span`
  font-size: 14px;
  line-height: 1.33;
  font-weight: 600;
  color: ${Colors.SECONDARY_50};
  display: inline-block;
  cursor: pointer;
  user-select: none;
`;
export const SelectDocumentReskin = styled.span`
  display: inline-block;
  cursor: pointer;
  user-select: none;
  color: var(--kiwi-colors-semantic-information);
`;

export const MobileDisplay = styled.div`
  display: block;
  ${mediaQuery.md`
    display: none;
  `}
`;
