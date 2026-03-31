import { Paper } from 'lumin-ui/kiwi-ui';
import styled, { css } from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import ModalFooter from 'lumin-components/ModalFooter';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { THEME_MODE } from 'constants/lumin-common';
import { Colors, Shadows } from 'constants/styles';

const lightTheme = {
  backgroundContainer: Colors.WHITE,
  boxShadow: Shadows.SHADOW_XL,
  bottomBlockBoxShadow: Shadows.SHADOW_S,
  title: Colors.NEUTRAL_100,
  subTitle: Colors.NEUTRAL_80,
  divider: Colors.NEUTRAL_20,
  activeBarTab: Colors.NEUTRAL_100,
  fileNameStatus: Colors.NEUTRAL_80,
  pendingUserHover: Colors.NEUTRAL_10,
  requestAccessButtonBgHover: Colors.NEUTRAL_20,
};

const darkTheme = {
  backgroundContainer: Colors.NEUTRAL_100,
  boxShadow: Shadows.SHADOW_XL_DARK,
  bottomBlockBoxShadow: Shadows.SHADOW_S_DARK,
  title: Colors.NEUTRAL_10,
  subTitle: Colors.NEUTRAL_20,
  divider: Colors.NEUTRAL_60,
  activeBarTab: Colors.NEUTRAL_80,
  fileNameStatus: Colors.NEUTRAL_60,
  pendingUserHover: Colors.NEUTRAL_80,
  requestAccessButtonBgHover: Colors.NEUTRAL_80,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

const ModalContainer = css`
  background: ${({ theme }) => theme.backgroundContainer || Colors.WHITE};
  border-radius: 8px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  width: 100%;
  padding: 16px;
  ${mediaQuery.md`
    padding: 24px;
  `}
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${(props) =>
    props.$bottomGap &&
    css`
      margin-bottom: 16px;
    `}
`;

export const Title = styled.h2`
  font-style: normal;
  font-weight: 600;
  color: ${({ theme }) => theme.title || Colors.NEUTRAL_100};
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  word-break: break-all;
  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}
  span {
    color: var(--color-neutral-80);
    font-weight: 400;
    font-size: 10px;
    line-height: 12px;
    ${mediaQuery.md`
      font-size: 12px;
      line-height: 16px;
    `}
  }
`;

export const TitleSecondary = styled.h2`
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  margin: 0 0 4px 0;
  color: ${({ theme }) => theme.title || Colors.NEUTRAL_100};
`;

export const SubTitle = styled.h3`
  font-style: normal;
  font-weight: normal;
  color: ${({ theme }) => theme.fileNameStatus || Colors.NEUTRAL_80};
  margin: 0 0 16px 0;
  font-size: 12px;
  line-height: 16px;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
  b {
    color: ${({ theme }) => theme.fileNameStatus || Colors.NEUTRAL_80};
    font-weight: 600;
  }
`;

export const SubTitleSecondary = styled.h3`
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  margin: 0;
  color: ${({ theme }) => theme.subTitle || Colors.NEUTRAL_80};
`;

export const SlotRemaining = styled.span`
  font-style: normal;
  font-weight: normal;
  color: ${({ theme }) => theme.subTitle || Colors.NEUTRAL_80};
  font-size: 10px;
  line-height: 12px;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const TopBlockContainer = styled.div`
  ${ModalContainer}
  ${mediaQuery.md`
    padding-bottom: 16px;
  `}
  box-shadow: ${({ theme }) => theme.boxShadow || Shadows.SHADOW_XL};
  margin-bottom: 4px;
`;

export const TopBlockContainerReskin = styled(Paper)`
  transition: var(--default-web-transition);
  padding: var(--kiwi-spacing-3);
`;

export const BottomBlockContainer = styled.div`
  ${ModalContainer}
  padding: 16px;
  box-shadow: ${({ theme }) => theme.bottomBlockBoxShadow || Shadows.SHADOW_S};
  ${mediaQuery.md`
    padding: 12px 24px;
  `}
`;
export const BottomBlockContainerReskin = styled(Paper)`
  transition: var(--default-web-transition);
  padding: var(--kiwi-spacing-2) var(--kiwi-spacing-3);
  margin-top: var(--kiwi-spacing-1);
`;

export const TopBlockFooter = styled.div`
  display: grid;
  gap: 16px;
  ${mediaQuery.md`
    grid-template-columns: 1fr 200px;
    ${(props) => !props.$useGrid && 'direction: rtl;'}
  `}
`;
export const DoneButton = styled(ButtonMaterial)`
  ${mediaQuery.md`
    width: 200px;
  `}
`;
export const TabsContainer = styled.div`
  ${(props) => props.$isManagerView && 'margin-top: 8px;'}
  background: white;
  ${mediaQuery.md`
    ${(props) => props.$isManagerView && ' margin-top: 12px;'}
  `}
`;

export const FooterButtonContainer = styled(ModalFooter)`
  margin-top: 24px;
`;

export const MemberListContainer = styled.div`
  min-height: 64px;
`;

export const ShareesListContainer = styled.div`
  padding: 0 0 8px;
  box-sizing: border-box;
  display: flex;
  ${mediaQuery.md`
    min-height: 300px;
  `}
`;

export const SwitchWrapper = styled.div`
  display: flex;
  justify-content: end;
`;

export const MemberSection = styled.div`
  display: flex;
  margin-top: 12px;
  padding-left: 4px;
`;

export const MemberSectionText = styled.p`
  color: ${Colors.NEUTRAL_60};
  font-style: normal;
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  margin-left: 10px;
`;

export const MemberSectionOrg = styled.span`
  color: ${Colors.NEUTRAL_60};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  margin: 0;
  text-decoration: underline;
  cursor: pointer;
  word-break: break-word;
`;
