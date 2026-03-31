import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { mediaQuery } from 'utils/styles/mediaQuery';
import { Fonts, Colors } from 'constants/styles';
import { typographies } from 'constants/styles/editor';

export const NotfoundDocContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: 24px auto auto;
  padding: 0 16px;
  ${mediaQuery.md`
    padding: 0 48px;
  `}
  ${mediaQuery.xl`
    max-width: 705px;
    padding: 0;
  `}
`;
export const RateLimitDocContainer = styled(NotfoundDocContainer)`
  ${mediaQuery.xl`
    max-width: 1000px;
  `}
`;
export const ImageContainer = styled.div`
  margin: 0 auto;
`;
export const NotfoundDocImage = styled.img`
  width: 180px;
  ${mediaQuery.md`
    margin: 0 auto;
    width: 283px;
  `}
`;
export const Title = styled.h1`
  margin-top: 24px;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};
  ${mediaQuery.md`
    margin-top: 48px;
    font-size: 24px;
    line-height: 32px;
  `}
`;
export const Message = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: ${Colors.NEUTRAL_80};
  margin-top: 12px;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const LinkContainer = styled.div`
  margin-top: 16px;
  text-align: center;
  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;
export const LineBreak = styled.br`
  ${mediaQuery.md`
    display: none;
  `}
`;

export const RedirectLink = styled(Link)`
  color: ${Colors.SECONDARY_50};
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  background: none;
  border: none;
  font-family: ${Fonts.PRIMARY};
  cursor: pointer;
  padding: 0;
  ${mediaQuery.md`
    font-size: 17px;
  `}
`;

export const Divider = styled.span`
  display: inline-block;
  font-weight: 600;
  line-height: 20px;
  font-size: 14px;
  color: ${Colors.SECONDARY_50};
  margin-right: 4px;
  ${mediaQuery.md`
    margin: 0 24px;
  `}
`;

export const SupportWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-left: 0;
  margin: 24px auto;
  width: 100%;

  ${mediaQuery.sm`
    justify-content: flex-start;
    padding-left: 32px;
    width: 636px;
    margin: 8px auto;
  `}
`

export const TroubleMessage = styled.p`
  ${{...typographies.le_body_medium}}
  ${({theme}) => `
    color: ${theme.le_main_on_surface}
  `}
`

export const SupportLink = styled(Link)`
  ${{...typographies.le_body_medium}}
  padding-left: 8px;
  text-decoration: underline;
  ${({theme}) => `
    color: ${theme.le_main_primary}
  `}
`
