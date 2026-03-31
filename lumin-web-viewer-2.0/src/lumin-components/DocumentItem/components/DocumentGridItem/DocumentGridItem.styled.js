import styled, { css } from 'styled-components';
import { Checkbox } from 'lumin-components/Shared/Checkbox';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

import * as DocumentItemStyled from '../../DocumentItem.styled';

const getDisplayStyled = ({ $display }) => $display && css`
  opacity: 1;
  visibility: visible;
`;

export const CheckboxWrapper = styled.div`
  position: absolute;
  left: 17px;
  top: 17px;
  z-index: 2;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out;
  ${getDisplayStyled}

  ${(props) => (props.$display && `
    width: 32px;
  `)};

  ${mediaQuery.md`
    left: 21px;
    top: 21px;
  `}

  ${mediaQuery.xl`
    left: 18px;
    top: 18px;
  `}
`;

export const Overlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate3d(-50%, -50%, 0);
  backface-visibility: hidden;
  border-radius: var(--border-radius-primary);
  transition: opacity 0.2s ease-in-out;
  opacity: 0;
  z-index: 1;
  visibility: hidden;
  background-color: ${Colors.DOCUMENT_OVERLAY};
  ${getDisplayStyled}
`;
export const DocumentStatus = styled(DocumentItemStyled.DocumentStatus)`
  right: -6px;
  left: auto;
`;

export const Container = styled(DocumentItemStyled.Container)`
  border: 1px solid ${Colors.NEUTRAL_20};
  box-sizing: border-box;
  border-radius: var(--border-radius-primary);
  padding: 8px;
  position: relative;
  transition: opacity 0.2s ease;
  ${({ $selected }) => $selected && `
    background-color: ${Colors.PRIMARY_10};
    border: 1px solid ${Colors.PRIMARY_80};
  `}

  ${({ $disabledSelection }) => ($disabledSelection ? `
    opacity: 0.5;
    .FavoriteIcon--disabled {
      opacity: 1;
      visibility: visible;
    }
    &:hover {
      ${Overlay} {
        background-color: ${Colors.DOCUMENT_OVERLAY};
        opacity: 1;
        visibility: visible;
      }
    }
  ` : `
    cursor: pointer;
    &:hover {
      ${Overlay} {
        background-color: ${Colors.DOCUMENT_OVERLAY};
        transform: translate(-50%, -50%) scale(1, 1);
        opacity: 1;
      }
      ${CheckboxWrapper} {
        opacity: 1;
        visibility: visible;
      }
    }
  `)};

  ${({ $isDragging }) => ($isDragging && `
    opacity: 0.5;
  `)}

  ${mediaQuery.md`
    padding: 12px;
  `}
`;

export const ThumbnailContainer = styled.div`
  margin-bottom: 8px;
  width: 100%;
  height: 70px;
  position: relative;
  ${mediaQuery.md`
    height: 103px;
  `}
  ${mediaQuery.xl`
    height: 86px;
  `}
`;

export const ThumbnailWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: var(--border-radius-primary);
  box-sizing: border-box;
  overflow: hidden;
`;

export const DocumentNameWrapper = styled.div`
  margin-bottom: 4px;
`;

export const TopInfoContainer = styled.div`
  display: grid;
  grid-template-columns: 24px auto 18px 24px;
  column-gap: 8px;
  align-items: center;
  border-bottom: 1px solid ${Colors.NEUTRAL_20};
  padding-bottom: 8px;
`;

export const BottomInfoContainer = styled.div`
  display: grid;
  grid-template-columns: 24px auto 24px;
  column-gap: 8px;
  align-items: center;
  padding-top: 8px;
`;

export const LastAccessLabel = styled(DocumentItemStyled.Text)`
  margin-top: 3px;
`;

export const FavoriteWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 3px;
`;

export const CustomCheckbox = styled(Checkbox)`
  padding: 0;
  background: ${Colors.NEUTRAL_0};
  border-radius: 4px;
  &:hover {
    background: ${Colors.NEUTRAL_0};
  }
`;

export const ExpiredTag = styled(DocumentItemStyled.ExpiredTag)`
  width: 40px;
  height: 16px;
  top: -5px;
  right: -5px;
  left: auto;
  font-size: 8px;
`;

export const OfflineStatusWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
