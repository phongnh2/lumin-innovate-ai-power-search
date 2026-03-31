import styled from 'styled-components';
import { Button } from '@mui/material';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { mediaQueryDown } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  border-radius: var(--border-radius-primary);
  padding: 0;
  margin-bottom: 8px;
  background-color: ${({ theme }) => theme.requestAccessList.background};
`;

export const Header = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: none;
  width: 100%;
  padding-left: 16px;
  padding-right: 16px;
  border-radius: var(--border-radius-primary);
  color: ${({ theme }) => theme.requestAccessList.headerText};
  &:hover,
  &:active {
    background-color: ${({ theme }) => theme.requestAccessList.headerTextHover};
  }
`;

export const Title = styled.h3`
  display: flex;
  align-items: center;
  font-size: 14px;
  line-height: 20px;
  font-weight: 375;
  span {
    margin-left: 8px;
  }
  b {
    font-weight: 600;
  }

  ${mediaQueryDown.md`
    font-size: 10px;
    line-height: 12px;
  `}
`;

export const Body = styled.div`
  padding: 0 8px 8px 8px;
`;

export const ViewAllContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const ViewAll = styled(ButtonMaterial)`
  text-decoration: underline;
  color: ${({ theme }) => theme.requestAccessList.viewAll};
  &:hover {
    color: ${({ theme }) => theme.requestAccessList.viewAll};
    text-decoration: underline;
  }
`;