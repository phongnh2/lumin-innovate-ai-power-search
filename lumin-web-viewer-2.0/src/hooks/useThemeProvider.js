import { useThemeMode } from 'hooks/useThemeMode';
import Theme from 'constants/theme';

function useThemeProvider(theme = '') {
  const themeModeDefault = useThemeMode();
  const themeMode = theme || themeModeDefault;
  return {
    themeMode,
    SharedComponents: {
      Button: Theme.Button.BUTTON_THEME[themeMode],
      Checkbox: Theme.Checkbox.CHECKBOX_THEME[themeMode],
      MenuItem: Theme.MenuItem.MENU_ITEM_THEME[themeMode],
      Tab: Theme.Tab.TAB_THEME[themeMode],
      ButtonIcon: Theme.ButtonIcon.BUTTON_ICON_THEME[themeMode],
      Textarea: Theme.Textarea.TEXTAREA_THEME[themeMode],
      ActivityFeed: Theme.ActivityFeed.ACTIVITY_FEED_THEME[themeMode],
    },
  };
}

export { useThemeProvider };
