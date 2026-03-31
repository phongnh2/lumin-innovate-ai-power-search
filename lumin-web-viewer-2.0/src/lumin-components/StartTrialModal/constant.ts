import { Colors, Shadows } from 'constants/styles';

export const lightTheme = {
  title: Colors.NEUTRAL_100,
  subTitle: Colors.NEUTRAL_80,
  message: Colors.NEUTRAL_80,
  checkboxLabel: Colors.NEUTRAL_80,
  checkboxBorder: Colors.NEUTRAL_30,
};

export const darkTheme = {
  title: Colors.NEUTRAL_10,
  subTitle: Colors.NEUTRAL_20,
  message: Colors.NEUTRAL_20,
  checkboxLabel: Colors.NEUTRAL_20,
  checkboxBorder: Colors.NEUTRAL_60,
};

export const lightThemeReskin = {
  closeBtnColor: Colors.LUMIN_SIGN_PRIMARY,
  title: Colors.LUMIN_SIGN_PRIMARY,
  subTitle: Colors.LUMIN_SIGN_PRIMARY,
  message: Colors.LUMIN_SIGN_PRIMARY,
  checkboxLabel: Colors.LUMIN_SIGN_PRIMARY,
  checkboxBorder: Colors.GRAY_4,
  checkboxBg: Colors.NEUTRAL_0,
  checkedColor: Colors.PRIMARY_90,
  dialogBg: Colors.NEUTRAL_0,
  dialogBoxShadow: Shadows.SHADOW_LIGHT_DIALOG_RESKIN,
};

export const darkThemeReskin = {
  closeBtnColor: Colors.NEUTRAL_0,
  title: Colors.OTHER_24,
  subTitle: Colors.OTHER_24,
  message: Colors.OTHER_24,
  checkboxLabel: Colors.OTHER_24,
  checkboxBorder: Colors.OTHER_24,
  checkboxBg: Colors.OTHER_23,
  checkedColor: Colors.NEUTRAL_5,
  dialogBg: Colors.OTHER_23,
  dialogBoxShadow: Shadows.SHADOW_DARK_DIALOG_RESKIN,
};
