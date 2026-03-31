import styled from 'styled-components';

import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const AvatarWrapper = styled.img`
  width: 48px;
  height: 48px;
`;

export const Title = styled.h3`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-top: 16px;
  text-align: center;

  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const Content = styled.div`
  margin-top: 8px;
`;

export const Description = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  text-align: center;

  &:nth-child(2) {
    margin-top: 24px;
  }

  b {
    font-weight: 600;
  }

  a {
    color: ${Colors.SECONDARY_50};
    text-decoration: underline;
    font-weight: 600;
  }
`;

export const ButtonWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  margin-top: 24px;
`;
