import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const EnterpriseAdvertisement = styled.p`
  font-size: 12px;
  line-height: 16px;
  font-weight: 375;
  color: ${Colors.NEUTRAL_80};
  margin-top: 12px;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    margin-top: 16px;
  `}
`;

export const EnterpriseLink = styled.a`
  white-space: nowrap;
  font-weight: 600;
  color: ${Colors.SECONDARY_50};
`;

export const TeamPromotion = styled.div`
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`;

export const PromotionText = styled.p`
  font-size: 12px;
  line-height: 16px;
  font-weight: 375;
  color: ${Colors.SUCCESS_50};
`;
