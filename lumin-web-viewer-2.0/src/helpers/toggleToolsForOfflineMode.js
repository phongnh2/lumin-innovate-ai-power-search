import core from 'core';
import dataElements from 'constants/dataElement';
import toolsName from 'constants/toolsName';
import defaultTool from 'constants/defaultTool';

const disabledElements = [
  dataElements.REDACTION_BUTTON,
  dataElements.TEXT_REDACT_TOOL_BUTTON,
  dataElements.CONTENT_EDIT_BUTTON,
  dataElements.FORM_BUILD_PANEL,
];

const disableToolsForOfflineMode = () => {
  if ([toolsName.CONTENT_EDIT, toolsName.REDACTION].includes(core.getToolMode().name)) {
    core.setToolMode(defaultTool);
  }
  core.disableElements(disabledElements);
};

const enableDisabledTools = (enableElements) => {
  enableElements(disabledElements);
};
export { disableToolsForOfflineMode, enableDisabledTools };
