import styled from 'styled-components';
import { CircularProgress } from '@mui/material';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  display: inline-block;
  width: ${({ $size }) => $size || 12}px;
  height: ${({ $size }) => $size || 12}px;
  background-color: ${Colors.NEUTRAL_20};
  border-radius: 50%;
`;

export const Progress = styled(CircularProgress)`
  color: ${Colors.NEUTRAL_60};
`;
