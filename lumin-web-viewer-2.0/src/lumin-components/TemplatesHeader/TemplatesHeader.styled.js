import styled from 'styled-components';
import { makeStyles } from '@mui/styles';

import * as NavigationStyled from 'lumin-components/NavigationBar/NavigationBar.styled';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const useStyles = makeStyles({
  tab: {
    width: 'max-content',
    maxWidth: '320px',
    flex: 'none',
  },
});

export const Container = styled.div`
  margin-bottom: 24px;
  ${mediaQuery.md`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  `}
  ${mediaQuery.xl`
    margin-bottom: 0;
  `}
`;

export const Title = styled(NavigationStyled.Title)`
  margin-bottom: 16px;
  overflow: hidden;
  white-space: nowrap;
  flex-shrink: 0;
  ${mediaQuery.md`
    margin-bottom: 0;
  `}
`;

export const Header = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  padding-right: 16px;

  ${Title} {
    max-width: calc(100% - 34px);
    margin-right: 16px;
  }
`;

export const SearchContainer = styled.div`
  display: block;
  ${mediaQuery.md`
    display: grid;
    column-gap: 16px;
    grid-template-columns: minmax(0, 1fr) min-content;
    width: 100%;
  `}
  ${mediaQuery.xl`
    column-gap: 24px;
  `}
`;
