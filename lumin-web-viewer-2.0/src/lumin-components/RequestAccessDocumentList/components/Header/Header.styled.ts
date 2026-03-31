import styled from 'styled-components';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({theme}) => theme.requestAccessList.headerTextHover};
  margin: 0 16px 4px;
  ${mediaQuery.md`
    margin: 0 24px 4px;
  `}
`;

export const TextWrapper = styled.div`
  margin-left: 3px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const Text = styled.p`
  font-weight: 375;
  margin: 0;
  color: ${({theme}) => theme.requestAccessList.subHeaderText};
  font-size: 12px;
  line-height: 16px;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
  b {
    font-weight: 600;
  }
`;
