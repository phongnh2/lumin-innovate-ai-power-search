import styled from 'styled-components';
import { Fonts, Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  width: 40%;
  ${mediaQuery.xl`
    width: 50%;
    padding-right: 32px;
  `}
`;
export const AvatarWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const Name = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-left: 8px;
  word-break: break-word;

  ${mediaQuery.xl`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const Plan = styled.h4`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  color: ${Colors.NEUTRAL_90};
  text-transform: capitalize;
  margin-top: 40px;

  ${mediaQuery.xl`
    font-size: 32px;
    line-height: 36px;
    margin-top: 32px;
  `}
`;
