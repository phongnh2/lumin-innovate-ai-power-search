import styled from 'styled-components';

import { typographies, spacings } from 'constants/styles/editor';

import IconButton from '../IconButton';

export const Header = styled.div`
  width: 100%;
  padding: ${spacings.le_gap_1}px ${spacings.le_gap_1_5}px;
  display: flex;
  justify-content: space-between;
  background-color: transparent;
  align-items: center;
`;

export const Title = styled.span`
  ${{ ...typographies.le_title_small }};
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;

  span {
    margin: ${spacings.le_gap_0}px !important;
  }
`;

export const ClosePanelButton = styled(IconButton)`
  width: 32px;
  height: 32px;
  min-width: 32px;
  i {
    color: ${({ theme }) => theme.le_main_on_surface_variant};
    font-size: 24px;
  }
`;