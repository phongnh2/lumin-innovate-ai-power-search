import styled from 'styled-components';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledTitle = styled.h2`
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 17px;
  color: ${Colors.NEUTRAL_100};
  text-align: center;
  line-height: 24px;
`;

export const StyledDesc = styled.h6`
  margin-bottom: 16px;
  font-weight: 400;
  color: ${Colors.NEUTRAL_80};
  text-align: center;
  font-size: 14px;
  line-height: 20px;

  b {
    color: ${Colors.NEUTRAL_100};
    font-weight: 600;
  }

  ${mediaQuery.md`
    margin-bottom: 8px;
  `}
`;

export const StyledOrganizationName = styled.span`
  color: ${Colors.NEUTRAL_100};
  font-weight: 600;
  white-space: normal;
  word-break: break-word;
`;

export const StyledPriceWrapper = styled.div`
  width: 100%;
  padding: 12px 0;
  color: ${Colors.NEUTRAL_100};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: 0.34px;
  background: ${Colors.SECONDARY_10};
  text-align: center;
  border-radius: var(--border-radius-primary);
`;

export const StyledTotalPrice = styled.span`
  color: ${Colors.SECONDARY_50};
  font-weight: 600;
`;

export const StyledMainIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;

  ${mediaQuery.md`
    margin-bottom: 24px;
  `}
`;

export const StyledFooter = styled.div`
  padding-top: 16px;
  ${mediaQuery.md`
    padding-top: 24px;
  `}
`;
