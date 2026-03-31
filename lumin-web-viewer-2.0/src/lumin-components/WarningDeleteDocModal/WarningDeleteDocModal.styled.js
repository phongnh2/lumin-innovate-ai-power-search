import styled from 'styled-components';

import { DialogContent, FormControlLabel } from '@mui/material';
import { withStyles } from '@mui/styles';

import { Checkbox } from 'luminComponents/Shared/Checkbox';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledFormControlLabel = withStyles({
  root: {
    margin: '20px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '20px',
    color: Colors.NEUTRAL_80,
    cursor: 'pointer',
    textAlign: 'left',
  },
  '@media (max-width: 767)': {
    label: {
      textAlign: 'center',
    },
  },
})(FormControlLabel);

export const StyledCheckbox = styled(Checkbox)`
  padding: 0 7px 0 0;
`;

export const StyledDialogContent = withStyles({
  root: {
    padding: '0',
    boxSizing: 'border-box',
    '&:first-child': {
      padding: '0',
    },
  },
  '@media (max-width: 600px)': {
    root: {
      width: '100%',
    },
  },
})(DialogContent);

export const StyledTitle = styled.h2`
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  overflow-wrap: break-word;
  text-align: center;
  color: ${Colors.NEUTRAL_100};
  ${mediaQuery.sm`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const StyledDesc = styled.p`
  font-weight: 400;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  b {
    font-weight: 600;
    color: ${Colors.NEUTRAL_100};
  }
`;

export const StyledMainIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

export const StyledFooter = styled.div`
  ${({ $hasMargin }) => $hasMargin && `
    margin-top: 16px;
  `}
  ${mediaQuery.md`
    ${({ $hasMargin }) => $hasMargin && `
      margin-top: 24px;
    `}
  `}
`;
