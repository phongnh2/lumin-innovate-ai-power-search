import styled from '@emotion/styled';

import { Colors, mediaQueryDown } from '@/ui';
import { Fonts } from '@/ui/utils/font.enum';

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  background-color: ${Colors.NEUTRAL_5};
`;

export const Wrapper = styled.div`
  padding: 44px 32px;
  margin-top: 160px;
  max-width: 640px;
  width: 100%;
  height: 360px;
  background-color: ${Colors.NEUTRAL_0};
  text-align: center;
  border-radius: 8px;
  filter: drop-shadow(0px 10px 32px rgba(12, 90, 112, 0.1)) drop-shadow(0px 6px 14px rgba(12, 90, 112, 0.12));

  ${mediaQueryDown.sm} {
    padding: 44px 24px;
    margin-top: 80px;
    max-width: 328px;
    height: 298px;

    img {
      width: 180px;
      height: 138px;
    }
  }
`;

export const Title = styled.h2`
  color: ${Colors.NEUTRAL_100};
  font-family: ${Fonts.Primary};
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: 32px;
  margin: 24px 0 8px 0;

  ${mediaQueryDown.sm} {
    font-size: 17px;
    line-height: 24px;
    margin: 24px 0 4px 0;
  }
`;

export const Content = styled.p`
  margin-bottom: 0;
  color: ${Colors.NEUTRAL_80};
  font-family: ${Fonts.Primary};
  font-size: 17px;
  font-style: normal;
  font-weight: 375;
  line-height: 24px;

  ${mediaQueryDown.sm} {
    font-size: 14px;
    line-height: 20px;
  }
`;
