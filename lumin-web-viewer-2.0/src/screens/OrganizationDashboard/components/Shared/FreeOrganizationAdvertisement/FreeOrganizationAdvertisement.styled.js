import styled from 'styled-components';
import { Link } from 'react-router-dom';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledContainer = styled.div`
  background-color: ${Colors.WHITE};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
  ${mediaQuery.xl`
    margin: 0px 28px;
    padding-top: 16px;
  `}
`;

export const StyledHeader = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
  text-align: center;
  line-height: 28px;
  margin-bottom: 8px;
  ${mediaQuery.xl`
    font-size: 24px;
    line-height: 32px;
  `}
`;

export const StyledDescription = styled.h6`
  color: ${Colors.NEUTRAL_80};
  font-weight: 400;
  text-align: center;
  line-height: 20px;
  margin-bottom: ${({ isSecurityTab }) => isSecurityTab ? '24px' : '32px'};
  font-size: 14px;
  max-width: 540px;
  ${mediaQuery.xl`
    max-width: none;
  `}
`;

export const StyledFeaturesContainer = styled.div`
  display: flex;
`;

export const StyledFeatureCardContainer = styled.div`
  box-sizing: border-box;
  height: 224px;
  width: 224px;
  margin-right: 24px;
  border-radius: 50%;
  background-color: ${Colors.NEUTRAL_5};
  flex: 1;
  display: flex;

  &:last-child {
    margin-right: 0;
  }

  ${mediaQuery.xl`
    height: 280px;
    width: 280px;
    margin-right: 40px;
  `}

`;

export const StyledFeatureCard = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
  ${mediaQuery.xl`
    padding-top: 60px;
  `}
`;

export const StyledFeatureText = styled.p`
  color: ${Colors.NEUTRAL_80};
  font-weight: 400;
  text-align: center;
  line-height: 16px;
  font-size: 12px;
  max-width: 195px;
  ${mediaQuery.xl`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const StyledFeatureImage = styled.img`
  min-width: 80px;
  height: 90px;
  display: block;
  padding: 0;
  margin: 0 auto 16px;
  ${mediaQuery.xl`
    min-width: 80px;
    height: 108px;
  `}
`;

export const StyledLink = styled(Link)`
  color: ${Colors.SECONDARY_50};
  font-weight: 600;
  line-height: 1.43;
  font-size: 14px;

  &:hover {
    cursor: pointer;
    color: ${Colors.SECONDARY_60};
  }
`;

export const StyledButtonLink = styled(ButtonMaterial)`
  width: 320px;
  margin-bottom: 30px;
`;

export const StyledButtonList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 320px;
  margin-top: ${({ isSecurityTab }) => (isSecurityTab ? '24px' : '40px')};
`;

export const StyledImageSecurity = styled.img`
  width: 340px;
  height: 254px;
  display: block;
  padding: 0;
`;
