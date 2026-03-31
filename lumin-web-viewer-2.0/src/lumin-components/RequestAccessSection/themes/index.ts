import { THEME_MODE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

export default {
  [THEME_MODE.LIGHT]: {
    background: Colors.NEUTRAL_10,
    headerText: Colors.NEUTRAL_100,
    headerTextHover: Colors.NEUTRAL_20,
    itemTitle: Colors.NEUTRAL_20,
    itemTitleBold: Colors.NEUTRAL_10,
    rejectButtonColor: Colors.SECONDARY_50,
  },
  [THEME_MODE.DARK]: {
    background: Colors.NEUTRAL_90,
    headerText: Colors.NEUTRAL_10,
    headerTextHover: Colors.NEUTRAL_80,
    itemTitle: Colors.NEUTRAL_20,
    itemTitleBold: Colors.NEUTRAL_10,
    rejectButtonColor: Colors.SECONDARY_40,
    viewAll: Colors.PRIMARY_20,
  },
};