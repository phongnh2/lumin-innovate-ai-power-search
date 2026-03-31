import styled from 'styled-components';
import { makeStyles } from '@mui/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const useStyles = makeStyles({
  popperContent: {
    '&&': {
      padding: 0,
    },
  },
  // Prevent notification popper and trial modal are same layout
  popper: {
    zIndex: '1100 !important',
  },
});

export const MobilePanel = styled.div`
  ${mediaQuery.md`
    display: none;
  `}
`;