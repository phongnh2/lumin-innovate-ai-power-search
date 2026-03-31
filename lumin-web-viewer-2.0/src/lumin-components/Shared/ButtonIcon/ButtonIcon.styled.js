import { makeStyles } from '@mui/styles';

import themeConstants from 'constants/theme';

export const useStyles = makeStyles({
  button: ({ color, size, isActive, theme, rounded }) => {
    const colorStyles = themeConstants.ButtonIcon.buttonIconColorGetter({ theme, color, isActive });

    return {
      width: size,
      minWidth: size,
      height: size,
      padding: 0,
      borderRadius: rounded ? '50%' : 'var(--border-radius-primary)',
      border: !isActive && colorStyles.root.border,
      background: (isActive ? colorStyles.backgroundIsActive : colorStyles.background) || colorStyles.root.background,
      transition: 'all 0.3s ease',
      '&:hover': {
        background:
          (isActive ? colorStyles.backgroundHoverIsActive : colorStyles.backgroundHover) ||
          colorStyles.hover.background,
      },
      '&:disabled': {
        opacity: 0.6,
      },
    };
  },
  icon: ({ isActive, iconColor, theme, color }) => {
    const colorStyles = themeConstants.ButtonIcon.buttonIconColorGetter({ theme, color, isActive });
    const colorIsActive = isActive ? colorStyles.colorActive : colorStyles.color;

    return ({
      color: iconColor || (isActive && colorIsActive) || colorStyles.root.iconColor,
    });
  },
});
