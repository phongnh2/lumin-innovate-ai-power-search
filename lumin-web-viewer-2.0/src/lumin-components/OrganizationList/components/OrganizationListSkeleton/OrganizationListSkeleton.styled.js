import styled from 'styled-components';
import { Grid } from '@mui/material';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
`;

export const Wrapper = styled(Grid)`
  width: 100%;
  display: flex;
  padding: 0;
  height: 64px;
  border-bottom: var(--border-secondary);
`;

export const Avatar = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 16px;
`;

export const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const Item = styled(Grid)`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${({ $hideInMobile }) => $hideInMobile && `
    display: none;
  `}
  ${({ $makeRole, $fullColumns }) => $makeRole && ($fullColumns ? `
    flex-basis: 4%;
  `: `
    justify-content: flex-end;
  `)}
  ${({ $dateJoined }) => $dateJoined && `
    max-width: 20%;
    flex-basis: 20%;
  `};
  ${mediaQuery.md`
    ${({ $hideInMobile }) => $hideInMobile && `
      display: flex;
    `}
  `}
`;
