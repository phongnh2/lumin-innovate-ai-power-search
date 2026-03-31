import styled, { css } from 'styled-components';
import { makeStyles } from '@mui/styles';
import { MenuList } from '@mui/material';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import SharedMenuItem from 'lumin-components/Shared/MenuItem';

import { Colors, Fonts, Shadows } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { TYPE_POPOVER } from './ShareSettingModal';

const lightTheme = {
  colorTitle: Colors.NEUTRAL_100,
  colorSubtitle: Colors.NEUTRAL_80,
  divider: Colors.NEUTRAL_20,
  input: {
    color: Colors.NEUTRAL_80,
    border: `1px solid ${Colors.NEUTRAL_100}`,
    background: Colors.NEUTRAL_10,
  },
  buttonCopy: {
    color: Colors.NEUTRAL_100,
    background: Colors.WHITE,
    border: `1px solid ${Colors.NEUTRAL_100}`,
    hoverBackground: Colors.NEUTRAL_10,
  },
  popover: {
    textColor: Colors.NEUTRAL_80,
    textHover: Colors.NEUTRAL_80,
    background: Colors.WHITE,
    border: `1px solid ${Colors.NEUTRAL_20}`,
    boxShadow: Shadows.SHADOW_XS,
  },
  iconLinkType: Colors.NEUTRAL_100,
  iconDocRoles: Colors.NEUTRAL_60,
};

const darkTheme = {
  colorTitle: Colors.NEUTRAL_10,
  colorSubtitle: Colors.NEUTRAL_20,
  divider: Colors.NEUTRAL_80,
  input: {
    color: Colors.NEUTRAL_20,
    border: `1px solid ${Colors.NEUTRAL_40}`,
    background: Colors.NEUTRAL_90,
  },
  buttonCopy: {
    color: Colors.NEUTRAL_20,
    background: Colors.NEUTRAL_80,
    border: `1px solid ${Colors.NEUTRAL_40}`,
    hoverBackground: Colors.NEUTRAL_90,
  },
  popover: {
    textColor: Colors.NEUTRAL_40,
    textHover: Colors.NEUTRAL_20,
    background: Colors.NEUTRAL_100,
    border: `1px solid ${Colors.NEUTRAL_80}`,
    boxShadow: Shadows.SHADOW_XS_DARK,
  },
  iconLinkType: Colors.NEUTRAL_40,
  iconDocRoles: Colors.NEUTRAL_40,
};

export const theme = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const useButtonPermissionStyles = makeStyles({
  label: {
    fontWeight: 600,
  },
});

export const Container = styled.div`
  box-shadow: ${Shadows.SHADOW_XL};
  background: ${({ theme }) => theme.backgroundContainer || Colors.WHITE};
  border-radius: var(--border-radius-primary);
  ${({ inShareLinkModal }) =>
    inShareLinkModal
      ? css`
        padding: 24px;
        ${mediaQuery.md`
          padding: 16px;
        `}
      `
      : css`
        padding: 16px;
        ${mediaQuery.md`
          padding: 24px;
        `}
      `};
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const Title = styled.h2`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colorTitle};
  margin-left: ${({ inShareLinkModal }) => (inShareLinkModal ? '0px' : '8px')};
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
`;

export const SubTitle = styled.h3`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorSubtitle};
  margin-top: 8px;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.divider};
  margin: 16px 0;
`;

export const InputWrapper = styled.div`
  display: grid;
  grid-template-columns: auto max-content;
  align-items: center;
  margin-top: 8px;
`;

export const LabelInput = styled.p`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorTitle};

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const Input = styled.input`
  height: 32px;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.input.color};
  background-color: ${({ theme }) => theme.input.background};
  padding: 8px 14px;
  border: ${({ theme }) => theme.input.border};
  border-top-left-radius: var(--border-radius-primary);
  border-bottom-left-radius: var(--border-radius-primary);
  box-sizing: border-box;
`;

export const ButtonCopy = styled.button`
  height: 32px;
  border-top-right-radius: var(--border-radius-primary);
  border-bottom-right-radius: var(--border-radius-primary);
  border: ${({ theme }) => theme.buttonCopy.border};
  border-left: none;
  padding: 0 18px;
  background-color: ${({ theme }) => theme.buttonCopy.background};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.buttonCopy.hoverBackground};
  }

  span {
    font-family: ${Fonts.PRIMARY};
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.buttonCopy.color};
    text-transform: none;
  }
`;

export const DropdownWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const DropdownContainer = styled.div`
  margin-left: -8px;
`;

export const DropdownButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const Menu = styled(MenuList)`
  min-width: ${({ $typePopover }) => ($typePopover === TYPE_POPOVER.LINK_TYPE ? '218px' : '180px')};
`;

export const MenuItem = styled(SharedMenuItem)`
   color: ${({ theme }) => theme.popover.textColor};
   &:hover {
    color: ${({ theme }) => theme.popover.textHover};
    i {
      color: ${({ theme }) => theme.popover.textHover};
    }
   }

   i {
    color: ${({ theme }) => theme.popover.textColor};
   }
`;

export const TextItem = styled.p`
  margin-left: 12px;
`;

export const TextButton = styled.p`
  font-weight: ${({ $thinFont }) => ($thinFont ? 400 : 600)};
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.colorTitle};
  margin-right: 8px;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: end;
  margin-top: 16px;
`;

export const ButtonSubmit = styled(ButtonMaterial)`
  min-width: 120px;

  ${mediaQuery.md`
    min-width: 228px;
  `}
`;
