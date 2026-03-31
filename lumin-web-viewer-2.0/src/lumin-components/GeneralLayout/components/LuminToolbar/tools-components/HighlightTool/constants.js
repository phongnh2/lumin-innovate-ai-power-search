import UserEventConstants from 'constants/eventConstants';
import TOOLS_NAME from 'constants/toolsName';

export const HIGHLIGHT_TOOL_VALUES = {
  TEXT_HIGHLIGHT: {
    value: TOOLS_NAME.HIGHLIGHT,
    icon: 'md_highlight',
    elementName: UserEventConstants.Events.HeaderButtonsEvent.HIGHLIGHT,
  },
  FREEHAND_HIGHLIGHT: {
    value: TOOLS_NAME.FREEHAND_HIGHLIGHT,
    icon: 'md_free_hand_highlight',
    elementName: UserEventConstants.Events.HeaderButtonsEvent.FREEHAND_HIGHLIGHT,
  },
};

export const HIGHLIGHT_TOOL_NAMES = [TOOLS_NAME.HIGHLIGHT, TOOLS_NAME.FREEHAND_HIGHLIGHT];
