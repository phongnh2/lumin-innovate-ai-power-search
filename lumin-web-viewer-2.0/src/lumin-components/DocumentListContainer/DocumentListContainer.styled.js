import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles/Colors';
import { Fonts } from 'constants/styles';

export const StyledDocumentListContainer = styled.div`
  width: 100%;
`;

export const StyledHeader = styled.div`
  background: ${Colors.ALICEBLUE};
  position: sticky;
  z-index: 10;
  padding: 8px 0;
  top: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  ${mediaQuery.md`
    top: 64px;
    padding-left: 24px;
    padding-right: 24px;
    margin-left: -24px;
    margin-right: -24px;
  `}
  ${mediaQuery.xl`
    width: 100%;
    padding-left: 40px;
    padding-right: 40px;
    margin-left: -40px;
    margin-right: -40px;
    top: ${(props) => `${props.isShownBanner ? 120 : 70}px`};
  `}
  &:before {
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

export const StyledTitle = styled.h3`
  font-size: 24px;
  font-weight: 400;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: normal;
  margin: 0;
  font-family: ${Fonts.SECONDARY};
`;

export const StyledControllerGroup = styled.div`
  display: flex;
  align-items: center;
`;
