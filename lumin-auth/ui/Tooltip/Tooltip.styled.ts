import styled from '@emotion/styled';
import { Tooltip as MuiTooltip, tooltipClasses } from '@mui/material';

import { Colors } from '../theme';

export const ToolTipStyled = styled(MuiTooltip)`
  & .${tooltipClasses.tooltip} {
    background-color: ${Colors.NEUTRAL_100};
    color: white;
  }
`;
