import styled from 'styled-components';
import { MenuList } from '@mui/material';
import MenuItem from 'lumin-components/Shared/MenuItem';

import { Colors, Fonts } from 'constants/styles';

export const StyledList = styled(MenuList)`
  padding: 0;
`;

export const StyledItem = styled(MenuItem)`
  min-height: 40px;
  padding-top: 0;
  padding-bottom: 0;

  span {
    font-family: ${Fonts.PRIMARY};
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    color: ${Colors.NEUTRAL_80};
    padding-top: 8px;
    padding-bottom: 8px;
  }
`;

export const StyledActionName = styled.span`
  margin-left: 12px;
`;
