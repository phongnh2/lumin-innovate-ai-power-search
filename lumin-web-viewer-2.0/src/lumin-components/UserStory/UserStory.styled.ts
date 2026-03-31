import styled from 'styled-components';

import Button from 'lumin-components/ButtonMaterial';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { MAX_WIDTH_CONTAINER } from 'constants/lumin-common';

export const Container = styled.div`
  background-color: ${Colors.NEUTRAL_10};
  padding: 32px 24px;

  ${mediaQuery.xl`
    padding: 50px 148px;
  `}
`;

export const Wrapper = styled.div`
  max-width: ${MAX_WIDTH_CONTAINER}px;
  margin: 0 auto;

  ${mediaQuery.md`
    display: flex;
    align-items: center;
  `}
`;

export const Thumbnail = styled.div`
  ${mediaQuery.md`
    width: 50%;
  `}
`;

export const ImageContainer = styled.div`
  margin-bottom: 16px;

  ${mediaQuery.md`
    margin-bottom: 0px;
  `}

  ${mediaQuery.xl`
    margin: 0px;
  `}
`;

export const Image = styled.img`
  border-radius: 4px;
  width: 100%;
  height: 100%;
`;

export const Heading = styled.h2`
  font-size: 17px;
  font-weight: 375;
  line-height: 24px;
  margin: 0 0 8px;

  ${mediaQuery.xl`
    font-size: 20px;
    font-weight: 400;
    line-height: 28px;
    margin-bottom: 4px;
  `}
`;

export const Description = styled.h3`
  margin: 0 0 24px;
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.xl`
    font-size: 36px;
    line-height: 54px;
    margin-bottom: 32px;
  `}
`;

export const ButtonWrapper = styled(Button)`
  font-weight: 600;
  min-width: 220px;
  font-size: 17px;
  line-height: 24px;

  ${mediaQuery.xl`
    min-width: 240px;
  `}
`;

export const InfoWrapper = styled.div`
  ${mediaQuery.md`
    width: 50%;
    margin-left: 32px;
  `}

  ${mediaQuery.xl`
    margin-left: 48px;
  `}
`;
