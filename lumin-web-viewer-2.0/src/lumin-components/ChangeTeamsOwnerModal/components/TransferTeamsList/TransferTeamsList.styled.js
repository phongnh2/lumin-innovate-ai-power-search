import { Colors } from 'constants/styles';
import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
`;

export const Item = styled.div`
  &:not(:last-child) {
    margin-bottom: 4px;
    ${mediaQuery.md`
      margin-bottom: 8px;
    `}
  }
`;
export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${Colors.NEUTRAL_20};
  margin: 16px 0;
`;
export const ScrollbarContainer = styled.div`
  margin-right: -24px;
`;
export const ScrollbarWrapper = styled.div`
  padding-right: 24px;
`;
