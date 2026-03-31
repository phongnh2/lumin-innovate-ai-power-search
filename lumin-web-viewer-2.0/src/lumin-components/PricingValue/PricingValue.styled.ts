import styled from 'styled-components';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { MAX_WIDTH_CONTAINER } from 'constants/lumin-common';

export const Container = styled.div`
  padding: 32px 16px;
  background-color: ${Colors.PRIMARY_20};

  ${mediaQuery.md`
    padding: 40px 24px;
  `}

  ${mediaQuery.xl`
    padding: 56px 138px 40px;
  `}
`;

export const Wrapper = styled.div`
  margin: 0 auto;

  ${mediaQuery.xl`
    max-width: ${MAX_WIDTH_CONTAINER}px;
  `}
`;

export const Title = styled.h2`
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  color: ${Colors.NEUTRAL_100};
  text-align: center;
  margin: 0 0 16px;

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
    margin-bottom: 24px;
  `}

  ${mediaQuery.xl`
    font-size: 36px;
    line-height: 54px;
    margin-bottom: 40px;
  `}
`;

export const ContentContainer = styled.div`
  ${mediaQuery.md`
    display: flex;
  `}

`;

export const LeftContent = styled.div`
  ${mediaQuery.md`
    width: 50%;
  `}
`;

export const RightContent = styled.div`
  display: none;

  ${mediaQuery.md`
    display: block;
    margin: auto 0 auto 14px;
    width: 50%;
  `}

  ${mediaQuery.xl`
    margin-left: 104px;
    max-width: 474px;
  `}
`;

export const ImageWrapper = styled.div``;

export const ValueItem = styled.div`
  background-color: ${Colors.WHITE};
  padding: 12px;
  border-radius: 8px;
  display: flex;
  margin-bottom: 12px;
  min-height: 84px;

  ${mediaQuery.md`
    padding: 16px;
  `}

  ${mediaQuery.xl`
    min-height: 128px;
    padding: 20px 24px;
    margin-bottom: 24px;
  `}
`;

export const Icon = styled.img`
  height: 32px;
  width: 32px;

  ${mediaQuery.xl`
    height: 48px;
    width: 48px;
  `}
`;

export const ContentWrapper = styled.div`
  margin-left: 12px;

  ${mediaQuery.xl`
    margin-left: 16px;
  `}
`;

export const ContentTitle = styled.h3`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  margin: 0 0 4px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.xl`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const Description = styled.h3`
  font-weight: 375;
  font-size: 10px;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
  margin: 0;

  ${mediaQuery.md`
    font-size: 12px;
    line-height: 16px;
  `}

  ${mediaQuery.xl`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const Image = styled.img`
  width: 100%;
`;