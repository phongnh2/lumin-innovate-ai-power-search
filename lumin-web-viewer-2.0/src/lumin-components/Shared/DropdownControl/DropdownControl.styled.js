import styled from 'styled-components';
import { makeStyles } from '@mui/styles';

import AppInput from 'lumin-components/Shared/Input';
import { Colors } from 'constants/styles';
import { isUsingLightMode } from 'utils/styled';

export const useStyles = makeStyles({
  popper: {
    width: 452,
    zIndex: '1301!important',
    boxSizing: 'border-box',
  },
});

export const Input = styled(AppInput)`
  padding-right: 40px;

  &:read-only {
    pointer-events: auto;
    cursor: pointer;
    background-color: ${(props) => (isUsingLightMode(props) ? Colors.WHITE : '#263d58')};
    color: ${(props) => (isUsingLightMode(props) ? Colors.PRIMARY : Colors.SELAGO)};
  }
`;

export const DropdownIcon = styled.div`
  position: absolute;
  top: 50%;
  transform: translate3d(0, -50%, 0);
  right: 16px;
  display: flex;
  align-items: center;
  pointer-events: none;
`;
