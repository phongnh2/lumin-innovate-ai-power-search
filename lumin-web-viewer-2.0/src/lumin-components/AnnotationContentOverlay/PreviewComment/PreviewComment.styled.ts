import styled from "styled-components";
import { CommentContentStyles } from 'features/Comments/comment.styled';

import { shadows, sizing, spacings, typographies } from 'constants/styles/editor'

export const Container = styled.div`
  position: relative;
  cursor: pointer;

  ::before {
    content: "";
    position: absolute;
    top: -40px;
    left: 0px;
    bottom: 100%;
    width: 100%;
  }
`;

export const Wrapper = styled.div`
  border-radius: 16px;
  padding: ${spacings.le_gap_2}px;
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_1}px;
  width: ${sizing.le_sizing_dialogs_xs}px;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Name = styled.h6`
  color: ${({ theme }) => theme.le_main_on_surface_variant};
  ${{ ...typographies.le_label_large}};
  margin-top: ${spacings.le_gap_1}px;
`

export const CreatedDate = styled.span`
  color: ${({theme}) => theme.le_main_on_surface_variant};
  ${{...typographies.le_label_small}};
`

export const Content = styled.p`
  ${CommentContentStyles};
`

export const ReplyCount = styled.span`
  color: ${({theme}) => theme.le_main_on_surface_variant};
  ${{...typographies.le_label_small}};
  text-transform: lowercase;
`

export const AvatarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${spacings.le_gap_0_5}px;
`;

export const Avatar = styled.div`
  border-radius: 50%;
  border: 1px solid le_main_outline_variant;
`;