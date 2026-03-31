import styled from 'styled-components';

import * as NavigationStyled from 'lumin-components/NavigationBar/NavigationBar.styled';

import { stretchChildren, stretchParent } from 'utils/styled';
import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors, Fonts } from 'constants/styles';

export const BoldText = styled.b`
  font-weight: 600;
  color: ${Colors.PRIMARY};
`;

export const ContentContainer = styled.div`
  box-sizing: border-box;
  ${stretchParent}
  ${stretchChildren}
  padding-bottom: 16px;
  ${mediaQuery.md`
    padding-bottom: 24px;
  `}
  ${mediaQuery.xl`
    padding: 32px 0 32px;
  `}
  ${({ $isInOrgPage }) => !$isInOrgPage && `
    padding: 16px;
    ${mediaQuery.md`
      padding: 24px;
    `}
  `}
`;

export const ContentContainerReskin = styled.div`
  box-sizing: border-box;
  height: 100%;
  overflow: visible;
`;

export const SearchResultText = styled.h6`
  font-family: ${Fonts.PRIMARY};
  font-size: 17px;
  line-height: 24px;
  font-weight: 600;
  letter-spacing: normal;
  margin: -12px 0 16px;
  z-index: 3;

  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
    margin: -16px 0 32px;
  `}
  ${mediaQuery.xl`
    font-size: 24px;
    line-height: 32px;
    margin-top: -32px;
  `}
`;

export const TitleWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  white-space: nowrap;
  min-width: 0;
  margin-bottom: 16px;
  padding-right: 16px;
  ${mediaQuery.md`
    margin-bottom: 0;
  `}

  ${mediaQuery.xl`
    min-width: 300px;
  `}
`;

export const TitleWrapperReskin = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  white-space: nowrap;
  min-width: 0;
`;

export const Title = styled(NavigationStyled.Title)`
  margin-right: 16px;
  ${mediaQuery.md`
    margin-right: 12px;
  `}
  ${mediaQuery.xl`
    margin-right: 16px;
  `}
`;

export const TitleReskin = styled.h1`
  text-overflow: ellipsis;
  overflow: hidden;
  color: var(--kiwi-colors-surface-on-surface);
`;

export const Container = styled.div`
  display: ${(props) => (props.$show ? 'flex' : 'none')};
  flex-direction: ${(props) => props.$show && 'column'};
  flex: 1;
`;

export const ContainerReskin = styled.div`
  display: ${(props) => (props.$show ? 'block' : 'none')};
  height: 100%;
`;
