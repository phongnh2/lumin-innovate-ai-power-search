import styled from 'styled-components';
import { Divider } from '@mui/material';

import { Checkbox } from 'luminComponents/Shared/Checkbox';

import { Colors, Shadows } from 'constants/styles';
import { mediaQuery, mediaQueryDown } from 'utils/styles/mediaQuery';
import * as DocumentItemStyled from '../../DocumentItem.styled';
import DocumentActionButton from '../DocumentActionButton';

export const MARGIN_WIDTH = '32px';
export const OWNER_CELL_WIDTH = '136px';
export const STORAGE_CELL_WIDTH = '58px';
export const LAST_OPENED_CELL_WIDTH = '84px';

export const CheckboxWrapper = styled.div`
  transition: all 0.3s ease;
  opacity: ${({ $display }) => ($display ? 1 : 0)};
  width: 32px;

  ${({ $display }) => (!$display && `
    width: 0;
  `)};

  ${mediaQuery.xl`
    position: absolute;
    left: -48px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
  `}
`;

export const CustomCheckbox = styled(Checkbox)`
  ${mediaQueryDown.xl`
    padding: 0 9px 0 0;
  `}
`;

export const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  width: 100%;
  box-sizing: border-box;
  border-bottom: var(--border-secondary);
  transition: all 0.3s ease;
  border-left: 2px solid transparent;
  cursor: ${(props) => (props.$disabled ? 'auto' : 'pointer')};
  ${({ $disabled }) => $disabled && `
    opacity: 0.5;
  `};
  ${({ $selected }) => $selected && `
    background-color: ${Colors.PRIMARY_10};
    border-left: 2px solid ${Colors.PRIMARY_70};
  `}

  ${mediaQuery.md`
    display: grid;
    grid-template-columns: 4fr 1fr ${STORAGE_CELL_WIDTH} ${LAST_OPENED_CELL_WIDTH} 40px;
    column-gap: 32px;
  `}
`;

export const Container = styled(DocumentItemStyled.Container)`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  ${mediaQuery.xl`
    background-color: #fff;

    ${(props) => (!props.$disabledSelection && `
      &:hover {
        ${Wrapper} {
          background-color: ${Colors.PRIMARY_10};
          box-shadow: ${Shadows.SHADOW_XS};
        }

        ${CheckboxWrapper} {
          opacity: 1;
        }
      }
    `)}

    ${({ $isDragging }) => ($isDragging && `
      ${Wrapper} {
        opacity: 0.5;
      }

      ${CheckboxWrapper} {
        opacity: 0.5;
      }

      &:hover {
        ${CheckboxWrapper} {
          opacity: 0.5;
        }
      }
    `)}}
  `}
`;

export const UploadInfoContainer = styled.div`
  display: flex;
  align-items: center;
  padding-left: 8px;
  box-sizing: border-box;
  min-width: 0;
  ${mediaQuery.xl`
    padding-left: 12px;
    width: 100%;
    flex-shrink: 0;
  `}
`;

export const ThumbnailContainer = styled.div`
  width: 32px;
  height: 32px;
  padding-bottom: 0;
  flex-shrink: 0;
  position: relative;
  margin-bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
`;

export const ThumbnailWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid ${Colors.NEUTRAL_20};
  position: relative;
  box-sizing: border-box;
`;

export const CommonInfoContainer = styled.div`
  display: grid;
  grid-template-columns: [favorite-col-start] minmax(0, min-content) [doc-name-col-start] minmax(0, 1fr) [doc-name-col-end];
  gap: 8px 12px;
  width: 100%;
  align-items: center;
  margin-left: 12px;
  overflow: hidden;

  ${mediaQuery.md`
    display: flex;
    column-gap: 0;
    justify-content: space-between;
    width: auto;
    flex: 1;
    min-width: 0;
    box-sizing: border-box;
  `}
`;

export const DocNameWrapper = styled.div`
  display: block;
  overflow: hidden;
`;

export const StarWrapper = styled.div`
  grid-row-start: 1;
  grid-column: favorite-col-start / doc-name-col-start;
  padding: 0;
  font-size: 0;
  min-width: 0;
  ${mediaQuery.md`
    min-width: auto;
    margin-left: 12px;
  `}
`;

export const StorageWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  margin-top: 3px;
`;

export const ButtonMore = styled(DocumentActionButton)`
  display: block;
  padding-right: 8px;
`;

export const NonMobileDescriptionWrapper = styled.div`
  display: none;
  ${mediaQuery.md`
    display: block;
    overflow: hidden;
  `}
`;

export const MobileNameWrapper = styled.div`
  grid-column: 1/3;
  display: flex;
  align-items: center;
  ${mediaQuery.md`
    display: none;
  `}
`;

export const ExpiredTag = styled(DocumentItemStyled.ExpiredTag)`
  font-size: 6px;
  width: 32px;
  height: 14px;
  bottom: 0;
  left: -8px;
`;

export const SearchedFolderText = styled.div`
  font-weight: 400;
  font-size: 10px;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
  border-right: 1px solid ${Colors.NEUTRAL_20};
  padding-right: 4px;
  margin-right: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100px;

  a {
    color: ${Colors.SECONDARY_50};
    font-weight: 600;
  }
  ${mediaQuery.md`
    font-size: 12px;
    line-height: 16px;
    border-right: none;
    margin-top: 4px;
    max-width: 100%;
  `}
`;

export const AdditionalInfoWrapper = styled.div`
  display: flex;
`;

export const CustomDivider = styled(Divider)`
  background-color: ${Colors.NEUTRAL_20};
  margin: 4px 8px 0 0;
`;

export const OfflineTag = styled.div`
  display: flex;
  background-color: ${Colors.NEUTRAL_10};
  margin-top: 4px;
  padding: 2px 4px;
  border-radius: 4px;
  font-weight: 375;
  font-size: 10px;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
`;
