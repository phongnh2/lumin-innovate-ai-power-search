import styled from 'styled-components';

import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors, Fonts } from 'constants/styles';
import * as NavigationStyled from 'lumin-components/NavigationBar/NavigationBar.styled';
import { stretchChildren, stretchParent } from 'utils/styled';

export const StyledContainer = styled.div`
  ${({ $isInOrgPage }) => ($isInOrgPage
    ? 'padding: 0;'
    : 'padding: 16px;')}
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  ${stretchChildren}
  ${stretchParent}

  ${mediaQuery.sm`
    ${({ $isInOrgPage }) => !$isInOrgPage && `
      padding: 24px 24px 40px;
    `}
  `}

  ${mediaQuery.xl`
    padding: 32px 0 32px;
  `}
`;

export const StyledContainerReskin = styled.div`
  height: 100%;
  ${({ $isInOrgPage }) => ($isInOrgPage
    ? 'padding: 0;'
    : 'padding: 16px;')}
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  ${stretchChildren}
  ${stretchParent}

  ${mediaQuery.sm`
    ${({ $isInOrgPage }) => !$isInOrgPage && `
      padding: 24px 24px 40px;
    `}
  `}
`;

export const StyledBottomSection = styled.div`
  display: flex;
  flex-direction: column;
  z-index: 1;
  position: relative;
  flex: 1;
`;

export const StyledUploadedDocumentList = styled.div`
  ${stretchParent}
  ${stretchChildren}
  .DocumentListHeader {
    top: 210px;

    ${mediaQuery.md`
      top: 226px;
    `}

    ${mediaQuery.xl`
      top: 239px;
    `}
  }
`;

export const DeleteFolderIcon = styled.img`
  width: 61px;
  margin: 0 auto;
`;

export const StyledResult = styled.h6`
  font-family: ${Fonts.PRIMARY};
  font-size: 17px;
  line-height: 24px;
  font-weight: 600;
  letter-spacing: normal;
  color: ${Colors.NEUTRAL_100};
  margin: -12px 0 16px;
  z-index: 3;

  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
    margin: -16px 0 24px;
  `}
  ${mediaQuery.xl`
    font-size: 24px;
    line-height: 32px;
    margin-top: -32px;
  `}
`;

export const StyledTitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  white-space: nowrap;
  overflow: hidden;
  margin-bottom: 18px;
  margin-right: 10px;
  ${mediaQuery.md`
    margin-bottom: -16px;
  `}
`;

export const StyledMainTitle = styled(NavigationStyled.Title)`
  margin-bottom: 10px;
  ${mediaQuery.md`
    margin-bottom: 0;
  `}
  ${mediaQuery.xl`
    margin-bottom: 4px;
  `}
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StyledMainBodyContainer = styled.div`
  display: ${(props) => (props.$show ? 'flex' : 'none')};
  flex-direction: ${(props) => props.$show && 'column'};
  flex: 1;
`;

export const StyledMainBodyContainerReskin = styled.div`
  display: ${(props) => (props.$show ? 'block' : 'none')};
  height: 100%;
`;

export const ContainerReskin = styled.div`
  height: 100%;
`;
