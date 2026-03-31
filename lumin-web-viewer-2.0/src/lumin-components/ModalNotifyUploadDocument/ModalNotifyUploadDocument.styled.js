import React from 'react';
import styled, { css } from 'styled-components';
import { FormControlLabel } from '@mui/material';
import { withStyles } from '@mui/styles';

import { Colors } from 'constants/styles/Colors';
import { mediaQuery } from 'utils/styles/mediaQuery';

import ButtonMaterial from 'luminComponents/ButtonMaterial';

export const StyledFormControlLabel = withStyles({
  root: {
    margin: '0 auto',
    paddingRight: 9,
  },
  label: {
    fontSize: 14,
    marginLeft: 0,
    fontWeight: 400,
    color: Colors.NEUTRAL_80,
  },
})(FormControlLabel);

export const StyledTitle = styled.h2`
  color: ${Colors.NEUTRAL_100};
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-align: center;
  margin-bottom: 8px;
  ${mediaQuery.md`
    font-size: 17px;
    font-weight: 600;
    line-height: 24px;
  `}
`;

export const StyledDesc = styled.p`
  color: ${Colors.NEUTRAL_80};
  font-size: 14px;
  margin-bottom: 16px;
  font-weight: 400;
  line-height: 20px;
  text-align: center;
`;

export const StyledMainIcon = styled.div`
  margin: 0 auto 16px;
`;

export const StyledOrgName = styled.span`
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
  white-space: normal;
  word-break: break-word;
`;

export const StyledOrgNameReskin = styled.span`
  font-weight: 700;
  white-space: normal;
  word-break: break-word;
  color: var(--kiwi-colors-surface-on-surface);
`;

export const StyledFooter = styled.div`
  padding-top: 8px;
  display: flex;
  justify-content: center;
  ${mediaQuery.md`
    padding-top: 16px;
  `}
`;

export const StyledButton = styled(({ isCancel, ...otherProps }) => <ButtonMaterial {...otherProps} />)`
  max-height: 40px;
  width: 168px;
  ${mediaQuery.md`
    max-height: none;
  `}
  ${(props) => (props.isCancel && css`
    margin-right: 12px;
    ${mediaQuery.md`
      margin-right: 16px;
    `}
  `)}
`;
