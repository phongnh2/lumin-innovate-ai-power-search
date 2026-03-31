import { t } from 'i18next';
import { AnyAction } from 'redux';

import actions from 'actions';
import { store } from 'store';

import { executeWithCancellation } from 'utils/executeWithCancellation';
import { getFirstPageExistText } from 'utils/getFirstPageExistText';

import { CHATBOT_TOOL_NAMES, MESSAGE_FOR_FULL_OCR_DOCUMENT } from 'features/EditorChatBot/constants';
import { useEditorChatBotAbortStore } from 'features/EditorChatBot/hooks/useEditorChatBotAbortStore';
import { setIsAiProcessing } from 'features/EditorChatBot/slices';
import { ToolCallType } from 'features/EditorChatBot/types';
import formFieldBackup from 'features/EditorChatBot/utils/formfieldBackup';
import { isDocumentFullOCRed } from 'features/EditorChatBot/utils/isDocHasInvisibleText';
import { toolCallingQueue } from 'features/EditorChatBot/utils/toolCallingQueue';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { handleReplaceTextForDocumentContent, findTextDocumentPosition } from './documentContent';
import { findFreetextAnnotations, handleUpdateTextForFreetext } from './freetext';
import { findTextFields, handleUpdateTextForFormField } from './textField';

export async function editText(toolCall: ToolCallType, currentDocument: IDocumentBase) {
  const { pages, oldText, newText } = toolCall.args as { pages: number[]; oldText: string; newText: string };
  const hasAppliedOCR = currentDocument?.metadata?.hasAppliedOCR;
  const firstPageExistText = await getFirstPageExistText();

  const abortSignal = useEditorChatBotAbortStore.getState().abortController?.signal;
  if (!firstPageExistText) {
    return MESSAGE_FOR_FULL_OCR_DOCUMENT;
  }
  const isFullOCRed = await isDocumentFullOCRed();
  if (isFullOCRed || hasAppliedOCR) {
    return MESSAGE_FOR_FULL_OCR_DOCUMENT;
  }

  const pageTexts = await executeWithCancellation({
    callback: findTextDocumentPosition,
    signal: abortSignal,
  })(oldText.trim().replace(/\s+/g, ' '), pages);

  const freetexts = findFreetextAnnotations(oldText, pages);
  const textWidgets = findTextFields(oldText, pages);
  if (!pageTexts.size && !freetexts.length && !textWidgets.length) {
    return `Please response user with this message : 'The word "${oldText}" does not appear on document'`;
  }
  store.dispatch(setIsAiProcessing(true));
  store.dispatch(actions.setBackDropMessage(t('viewer.chatbot.processingEditMode')) as AnyAction);
  /**
   * Please do not change the order of the following code
   * because form field value is reset when user edit/move text box
   * We need to backup and restore manually until Apryse team fix this issue
   *
   * @see https://support.apryse.com/support/tickets/122105
   */
  if (textWidgets.length) {
    formFieldBackup.backup();
    toolCallingQueue.addTask(handleUpdateTextForFormField, CHATBOT_TOOL_NAMES.EDIT_TEXT, textWidgets, oldText, newText);
  }
  if (pageTexts.size) {
    handleReplaceTextForDocumentContent(pageTexts, newText, abortSignal);
  }
  if (freetexts.length) {
    toolCallingQueue.addTask(handleUpdateTextForFreetext, CHATBOT_TOOL_NAMES.EDIT_TEXT, freetexts, oldText, newText);
  }
  const uniquePages = new Set(pages.sort((a, b) => a - b));
  const output = Array.from(uniquePages);
  const countChanges = Array.from(pageTexts.values()).reduce((acc, val) => acc + val.rects.length, 0);
  return `Please response user with this message : "I've replaced "${oldText}" by "${newText}" on the following pages:\n${output
    .map((page) => `- Page ${page}`)
    .join('\n')} \n\nTotal number of changes: ${freetexts.length + textWidgets.length + countChanges}"`;
}
