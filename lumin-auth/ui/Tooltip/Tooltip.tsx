import { TooltipProps, Tooltip as MuiTooltip, tooltipClasses } from '@mui/material';
import { merge, omit } from 'lodash';
import { useMemo } from 'react';

import { BorderRadius, Colors } from '../theme';
import { Fonts } from '../utils/font.enum';

type CustomTooltipProps = TooltipProps;

const Tooltip = ({ children, ...otherProps }: CustomTooltipProps) => {
  const componentProps = useMemo(
    () =>
      merge({}, otherProps.componentsProps, {
        tooltip: {
          sx: {
            bgcolor: Colors.NEUTRAL_100,
            color: 'white',
            fontSize: 12,
            fontFamily: Fonts.Primary,
            borderRadius: BorderRadius.Primary,
            p: '8px 16px',
            [`& .${tooltipClasses.arrow}`]: {
              color: Colors.NEUTRAL_100
            }
          }
        }
      }),
    [otherProps.componentsProps]
  );
  return (
    <MuiTooltip {...omit(otherProps, 'componentProps')} componentsProps={componentProps}>
      {children}
    </MuiTooltip>
  );
};

export default Tooltip;
