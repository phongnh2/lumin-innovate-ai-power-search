import styled from 'styled-components';
import { RadioGroup as BaseRadioGroup } from '@mui/material';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const RadioGroup = styled(BaseRadioGroup)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  ${mediaQuery.md`
    margin-bottom: 42px;
  `}
  ${mediaQuery.xl`
    margin-bottom: 52px;
  `}
`;
