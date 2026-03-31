import { Colors } from 'constants/styles';
import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  + * {
    margin-top: 16px;
  }
  ${mediaQuery.md`
    + * {
      margin-top: 24px;
    }
  `}
`;
export const Title = styled.h3`
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  font-weight: 600;
  margin: 0 0 12px 16px;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
    margin: 0 0 12px 24px;
  `}
`;
export const BodyContainer = styled.div`
  padding: 16px;
  border-radius: var(--border-radius-primary);
  background-color: ${Colors.NEUTRAL_5};
  ${mediaQuery.md`
    padding: 16px 24px;
  `}
`;
export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${Colors.NEUTRAL_20};
  margin: 16px 0;
`;
export const ItemTitle = styled.h6`
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  font-weight: 600;
  margin-bottom: 4px;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;
export const ItemText = styled.p`
  margin-bottom: 0;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  font-weight: 400;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;
export const ItemLayout = styled.div`
  ${(props) => props.$hasRightElement && `
    display: flex;
    align-items: center;
  `}
`;
