import styled from 'styled-components';
import { mediaQuery, mediaQueryDown } from 'utils/styles/mediaQuery';
import { Colors, Fonts } from 'constants/styles';

export const StyledTitle = styled.h2`
  font-family: ${Fonts.SECONDARY};
  font-size: 24px;
  font-weight: 400;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  color: ${Colors.PRIMARY};
  margin: 0;
  padding-bottom: 8px;
  flex: 1;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  min-width: 0;
  ${mediaQuery.md`
    line-height: 1.25;
    font-size: 32px;
  `}
`;

export const StyledContainer = styled.div`
  max-width: 1040px;
  margin: 0 auto;
`;

export const StyledDocumentListContainer = styled.div`

`;

export const StyledResult = styled.h6`
  font-family: ${Fonts.SECONDARY};
  font-size: 20px;
  line-height: 1.5;
  font-weight: 400;
  letter-spacing: normal;
  margin: 16px 0 0 0;
  ${mediaQuery.md`
    font-size: 24px;
    line-height: 1.33;
  `}
  ${mediaQuery.xl`
    font-size: 32px;
    line-height: 1.25;
    margin-top: 24px;
  `}
`;

export const StyledTabsContainer = styled.div`
  z-index: 10;
  background: ${Colors.ALICEBLUE};
  position: static;
  padding-top: 0px;
  margin-bottom: 12px;
  ${mediaQuery.sm`
    padding-top: 12px;
    margin: 0;
  `}
  &::before {
    content: '';
    display: block;
    position: absolute;
    z-index: 1;
    top: 0;
    bottom: 0;
    left: -15px;
    width: 15px;
    background-color: ${Colors.ALICEBLUE};
    ${mediaQuery.xs`
      left: -40px;
      width: 40px;
    `}
  }
`;

export const StyledHeader = styled.div`
  display: flex;
  flex-wrap: nowrap;
  margin-bottom: 16px;
  ${mediaQuery.lg`
    margin-bottom: 24px;
  `}
`;

export const StyledDropzoneWrapper = styled.div`
  margin-bottom: 24px;
`;

export const StyledTitleContainer = styled.div`
`;

export const StyledBoldText = styled.b`
  font-weight: 600;
  color: ${Colors.PRIMARY};
`;

export const StyledTeamList = styled.div`
  padding: 8px 0;
  max-width: 100%;
  ${mediaQueryDown.md`
    margin-top: 18px;
    padding-bottom: 0;
  `}
`;
export const HeaderMobile = styled.div`
  display: block;
  margin-top: 0;
`;
