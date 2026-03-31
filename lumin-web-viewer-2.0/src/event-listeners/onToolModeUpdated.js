import actions from 'actions';
import core from 'core';

import onStampToolSelect from 'helpers/onStampToolSelect';

import dataElements from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { AnnotationSubjectMapping } from 'constants/documentConstants';
import { TOOLS_NAME } from 'constants/toolsName';

export default (store) => (newTool, oldTool) => {
  const { dispatch, getState } = store;
  const state = getState();
  if (oldTool && oldTool.name === 'TextSelect') {
    core.clearSelection();
    dispatch(actions.closeElement('textPopup'));
  }

  if (oldTool && oldTool.name === TOOLS_NAME.SIGNATURE) {
    oldTool.hidePreview();
  }

  if (oldTool && [TOOLS_NAME.FREETEXT, TOOLS_NAME.DATE_FREE_TEXT].includes(oldTool.name)) {
    dispatch(actions.closeElement(dataElements.FREETEXT_PREVIEW));
  }

  if (newTool && [TOOLS_NAME.FREETEXT, TOOLS_NAME.DATE_FREE_TEXT].includes(newTool.name)) {
    dispatch(actions.openElement(dataElements.FREETEXT_PREVIEW));
  }

  if (newTool && newTool.name === defaultTool) {
    dispatch(actions.setActiveToolGroup(''));
    dispatch(actions.closeElement(dataElements.TOOLS_OVERLAY));
  }

  if (newTool?.name === TOOLS_NAME.STAMP) {
    onStampToolSelect(state);
  }

  dispatch(actions.setActiveToolNameAndStyle(newTool));

  const isNotRedactionTool =
    newTool && oldTool && oldTool.name === TOOLS_NAME.REDACTION && newTool.name !== TOOLS_NAME.REDACTION;

  if (isNotRedactionTool) {
    const annoList = core.getAnnotationManager().getAnnotationsList();
    const redactAnnotations = annoList.filter((annot) => annot.Subject === AnnotationSubjectMapping.redact);
    core.deleteAnnotations(redactAnnotations);
  }
};
