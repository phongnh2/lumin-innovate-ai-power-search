import { makeStyles } from '@mui/styles';
import styled from 'styled-components';

import { Colors } from 'constants/styles';

export const useStyles = makeStyles({
  root: {
    backgroundColor: Colors.PRIMARY_70,
    borderRadius: 9999999,
    height: 3,
  },
  bar: {
    backgroundColor:Colors.PRIMARY_40,
  },
});

export const LoadingBarContainer = styled.div`
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  z-index: 84;
`;
