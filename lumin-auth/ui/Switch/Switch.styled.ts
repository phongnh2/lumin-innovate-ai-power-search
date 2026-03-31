import styled from '@emotion/styled';
import { Switch as MuiSwitch, switchClasses } from '@mui/material';

import { Colors } from '../theme';

export const Switch = styled(MuiSwitch)`
  &.${switchClasses.root} {
    width: 30px;
    height: 18px;
    padding: 0;
  }
  .${switchClasses.switchBase} {
    color: ${Colors.NEUTRAL_30};
    padding: 3px;
    transition: all 0.5s ease;
    box-sizing: border-box;
    &.${switchClasses.checked} {
      transform: translateX(12px);
      color: ${Colors.WHITE};
      font-size: 12px;
      & + .${switchClasses.track} {
        background-color: ${Colors.NEUTRAL_100};
        opacity: 1;
        border: 1px solid;
        border-color: ${Colors.NEUTRAL_100};
      }
    }
    &.${switchClasses.disabled} {
      opacity: 1;
      background-color: ${Colors.NEUTRAL_20};
      color: ${Colors.NEUTRAL_30};
      border: none;
      & + .${switchClasses.track} {
        background-color: ${Colors.NEUTRAL_20};
        opacity: 1;
        border: 1px solid;
        border-color: ${Colors.NEUTRAL_20};
        cursor: not-allowed;
      }
    }
  }
  .${switchClasses.thumb} {
    width: 12px;
    height: 12px;
    box-shadow: none;
  }
  .${switchClasses.track} {
    border-radius: 24px;
    background-color: ${Colors.WHITE};
    border: 1px solid;
    border-color: ${Colors.NEUTRAL_60};
    opacity: 1;
    box-sizing: border-box;
  }
  .${switchClasses.checked} {
    color: ${Colors.WHITE};
  }
  .${switchClasses.disabled} {
  }
`;
