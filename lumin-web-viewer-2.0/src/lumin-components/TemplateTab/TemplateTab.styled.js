import styled from 'styled-components';
import { makeStyles } from '@mui/styles';

import BaseTabs from 'luminComponents/Shared/Tabs';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const useStyles = makeStyles({
  tab: {
    width: 'max-content',
    maxWidth: '320px',
    flex: 'none',
  },
});

export const Container = styled.div`
  margin-top: -8px;
  padding-top: 8px;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: ${Colors.WHITE};

  ${mediaQuery.xl`
    margin-top: 0;
    padding-top: 32px;
  `}
`;

export const Wrapper = styled.div`
  margin-bottom: 24px;
  position: relative;

  &:after {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    position: absolute;
    bottom: 0;
    left: 0;
    background: ${Colors.NEUTRAL_20};
    z-index: 1;
  }
`;

export const Tabs = styled(BaseTabs)`
  max-width: 850px;
  overflow: auto;
`;