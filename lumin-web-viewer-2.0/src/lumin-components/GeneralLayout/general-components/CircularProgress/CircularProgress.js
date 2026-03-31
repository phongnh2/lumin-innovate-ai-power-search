import Box from '@mui/material/Box';
import MuiCircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from 'styled-components';

import * as Styled from './CircularProgress.styled';

const CircularProgress = ({ size, thickness, content, ...props }) => {
  const theme = useTheme();
  const classes = Styled.useStyles({ theme, $size: size, $thickness: thickness });
  return (
    <Box position="relative" display="inline-flex">
      <MuiCircularProgress classes={classes} size={size} thickness={thickness} {...props} />
      {content && (
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Styled.Content>{content}</Styled.Content>
        </Box>
      )}
    </Box>
  );
};

CircularProgress.propTypes = {
  size: PropTypes.number,
  thickness: PropTypes.number,
  content: PropTypes.node,
  variant: PropTypes.oneOf(['determinate', 'indeterminate']),
};

CircularProgress.defaultProps = {
  size: 40,
  thickness: 4,
  content: '',
  variant: 'determinate',
};

export default CircularProgress;
