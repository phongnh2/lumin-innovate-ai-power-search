import { Button } from 'lumin-ui/kiwi-ui';
import styled, { css } from 'styled-components';

import Icomoon from 'lumin-components/Icomoon';

import { typographies, spacings } from 'constants/styles/editor';

export const CommentHistoryContainer = styled.div`
  height: 100%;
`;
export const CommentHistoryWrapper = styled.div`
  width: 100%;
  overflow: hidden;
  ${({ isShowExportFooter }) => css`
    --header-height: 48px;
    height: 100%;
    max-height: calc(100% - var(--header-height) - ${isShowExportFooter ? `${spacings.le_gap_7}px` : '0px'});
    margin-top: ${spacings.le_gap_6}px;
  `};

  div.ListSeparator.active {
    ${{ ...typographies.le_title_small }};
    margin: ${spacings.le_gap_1_5}px 0;
    ${({ theme }) => `
      color: ${theme.le_main_on_surface_variant};
    `};
  }
`;

export const AddNewCommentWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  margin-top: ${spacings.le_gap_4}px;
`;

export const NoCommentDescription = styled.p`
  ${{ ...typographies.le_body_medium }};
  margin-top: ${spacings.le_gap_3}px;
  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant};
  `};
`;

export const AddNewCommentButton = styled(Button)`
  margin-top: ${spacings.le_gap_4}px;
`;

export const CommentIcon = styled(Icomoon)`
  margin-right: ${spacings.le_gap_0_25}px;

  ${({ theme }) => `
    color: ${theme.le_main_primary};
  `};
`;
