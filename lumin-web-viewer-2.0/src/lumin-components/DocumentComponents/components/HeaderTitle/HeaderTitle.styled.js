import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Link } from 'react-router-dom';

export const HeaderTabletUp = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  ${mediaQuery.md`
    display: grid;
    grid-template-columns: minmax(0, 1fr) min-content;
    column-gap: 16px;
    margin-bottom: 32px;
  `}
  ${mediaQuery.xl`
    column-gap: 24px;
    margin-bottom: 0;
  `}
`;

export const HeaderMobile = styled.div`
  display: block;
  margin-bottom: 24px;
`;

export const LuminLogoReskin = styled.img`
  width: 88px;
  height: 24px;
`;

export const LuminLogoWrapper = styled(Link)`
  display: flex;
  align-items: center;
  width: fit-content;
`