import styled from 'styled-components';
import { typographies, spacings } from 'constants/styles/editor';
import Divider from 'lumin-components/GeneralLayout/general-components/Divider';
import Icomoon from 'lumin-components/Icomoon';
import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import MaterialAvatar from 'lumin-components/MaterialAvatar';
import { Colors } from 'constants/styles';
import { IconButtonProps } from '@new-ui/general-components/IconButton';
import { DRAGGABLE_COMMENT_CLASSNAME } from 'constants/commonConstant';

type DetailsContainerProps = {
  isReply: boolean;
}

type OptionalsProps = DetailsContainerProps & {
  isFloatingHeader: boolean;
}

type IconAnnotationWrapper = {
  annotationColor: string;
}

export const Container= styled.div`
  position: relative;
  width: 100%;

  ${({className}) => className === DRAGGABLE_COMMENT_CLASSNAME && `
    cursor: move; /* fallback if grab cursor is unsupported */
    cursor: grab;
    &:active {
      cursor: grabbing;
    }
  `}
`;

export const HeaderButton = styled(IconButton)<IconButtonProps>`
  padding: 0;
`;

export const DetailsContainer =  styled.div<DetailsContainerProps>`
  ${({isReply}) => `
     padding:  ${isReply ? 
      `${spacings.le_gap_1_5}px 0 ${spacings.le_gap_1}px 0;` 
    :
      `${spacings.le_gap_2}px ${spacings.le_gap_2}px ${spacings.le_gap_1}px ${spacings.le_gap_2}px;`
    }
  `}

  display: flex;
  justify-content: flex-start;
  align-items: center;
`;


export const DetailsWrapper =  styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: ${spacings.le_gap_1}px;
`;

export const AvatarContainer =  styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  margin-right: 10px;
`;

export const InfoContainer =  styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

export const AuthorName = styled.h6`
  ${typographies.le_label_large};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
    ${({theme}) => `
      color: ${theme.le_main_on_surface};
    `}
  `;
  
export const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const TimeDetail = styled.span`
  ${typographies.le_label_small};
  display: block;
  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant};
  `}

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const StyledMaterialAvatar = styled(MaterialAvatar)`
  &.NoteAvatar {
    border: 1px solid ${Colors.NEUTRAL_20};
  }
`;


export const OptionalsContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacings.le_gap_1}px;
  flex-shrink: 0;
`;

export const OptionalsWrapper = styled.div<OptionalsProps>`
  display: flex;
  ${({ isFloatingHeader, isReply }) => `
    ${
      isFloatingHeader
        ? `
        border-radius: 16px 16px 0 0;
        padding: ${spacings.le_gap_1}px;
        align-items: center;
        justify-content: flex-end;
        cursor: move; /* fallback if grab cursor is unsupported */
        cursor: grab;
        &:active {
          cursor: grabbing;
        }
      `
        : `
        right: ${isReply ? '0' : `${spacings.le_gap_2}px`};
        top: ${spacings.le_gap_2}px;
        position: absolute;
      `
    }
  `}
`;

export const IconAnnotationWrapper = styled.div`
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--annotation-color);
`;

export const IconAnnotation = styled(Icomoon)`
  ${({ theme }) => `
    color: ${theme.le_main_surface};
  `}
`;

export const CustomDivider = styled(Divider)`
  margin: 0;
`;

export const NoteDescription = styled.div`
  display: flex;
  align-items: center;
`;

export const SeparateDot = styled.div`
  width: 2px;
  min-width: 2px;
  height: 2px;
  border-radius: 9px;
  margin: 0 ${spacings.le_gap_0_5}px;

  ${({ theme }) => `
    background-color: ${theme.le_main_on_surface_variant};
  `};
`;

export const ReplyCountText = styled.div`
  ${{...typographies.le_label_small}};

  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant};
  `};

  margin-left: ${spacings.le_gap_0_25}px;
`;
