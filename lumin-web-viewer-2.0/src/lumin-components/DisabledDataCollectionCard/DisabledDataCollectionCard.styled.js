import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 4px 0 0;
`;

export const StyledText = styled.span`
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0.34px;
  text-align: center;
  color: ${({ isLockActivities }) => (isLockActivities ? Colors.NEUTRAL_80 : Colors.WHITE)};
  margin: 24px auto 8px;
  max-width: 325px;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 0px;
  `}
`;

export const StyledLink = styled(Link)`
  color: ${({ isLockActivities }) => (isLockActivities ? Colors.SECONDARY_50 : Colors.WHITE)};
  text-decoration: underline;
  font-weight: 600;
  cursor: pointer;
`;
