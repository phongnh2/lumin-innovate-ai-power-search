import styled from 'styled-components';
import { makeStyles } from '@mui/styles';
import { FormControlLabel } from '@mui/material';

import Radio from 'lumin-components/CustomRadio';

import { Colors, Fonts } from 'constants/styles';

export const StyledRadioWrapper = styled(FormControlLabel)`
  margin-left: 0;
  margin-top: ${({ $row, spacing }) => ($row ? 'unset' : `${spacing}px`)};
  margin-right: ${({ $row, spacing }) => $row && `${spacing}px`};
`;

export const StyledRadio = styled(Radio)`
  padding: 0;
  margin-right: 10px;
`;

export const StyledSubscription = styled.span`
  margin-top: 4px;
  margin-bottom: 16px;
  font-family: ${Fonts.PRIMARY};
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  color: ${Colors.SECONDARY};
`;

export const useStyles = makeStyles({
  label: {
    fontFamily: Fonts.PRIMARY,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: '20px',
    color: Colors.NEUTRAL_80,
  },
});
