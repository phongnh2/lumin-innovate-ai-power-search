import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import UserEventConstants from 'constants/eventConstants';
import { RESOLUTION_TYPE, DIVIDER_ID } from 'constants/lumin-common';
import { PremiumToolsPopOverEvent } from 'constants/premiumToolsPopOverEvent';
import toolsName from 'constants/toolsName';

export const ActiveHeaderGroups = {
  LUMIN: 'lumin',
  EDIT_PDF: 'editPDF',
};

export const CONTENT_EDIT_TOOL = [
  {
    type: 'toolButton',
    toolName: toolsName.CONTENT_EDIT,
    icon: 'tool-edit-text',
    title: 'annotation.contentEdit',
    dataElement: 'contentEditButton',
    hidden: [RESOLUTION_TYPE.SMALL_DESKTOP],
    'data-lumin-btn-name': ButtonName.EDIT_PDF,
    isRenderOnTablet: true,
    premiumRequired: true,
    permissionRequired: true,
    eventTrackingName: ButtonName.EDIT_PDF,
    eventName: PremiumToolsPopOverEvent.EditPdf,
  },
  {
    id: DIVIDER_ID.THREE,
    type: 'divider',
    hidden: [RESOLUTION_TYPE.SMALL_DESKTOP],
    isRenderOnTablet: true,
  },
];

export const SELECT_TOOLS = [
  {
    type: 'selectButton',
    toolName: 'AnnotationEdit',
    icon: 'tool-select icon__18',
    title: 'tool.select',
  },
  {
    type: 'selectButton',
    toolName: 'Pan',
    icon: 'tool-pan icon__18',
    title: 'tool.pan',
    eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.PAN_TOOL,
  },
  { type: 'divider' },
];

export const VIEW_TOOLS = [
  { type: 'zoomButton' },
  {
    type: 'toggleElementButtonWithArrow',
    icon: 'single-page-view icon__18',
    element: 'viewControlsOverlay',
    dataElement: 'viewControlsButton',
    title: 'component.viewControlsOverlay',
    arrow: true,
    eventTrackingName: UserEventConstants.Events.HeaderButtonsEvent.VIEW_CONTROL,
  },
];
