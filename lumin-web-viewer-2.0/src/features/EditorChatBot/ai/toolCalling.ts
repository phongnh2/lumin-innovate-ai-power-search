import { TFunction } from 'i18next';

import core from 'core';
import { store } from 'store';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

import {
  createShapeAnnot,
  deletePage,
  downloadFile,
  editText,
  getTextCoordinates,
  highlightText,
  insertBlankPage,
  movePage,
  printPdf,
  redact,
  textDecoration,
  insertOutlines,
  addComments,
} from './tools';
import { mergePage } from './tools/mergePage';
import { rotatePage } from './tools/rotatePage';
import { CHATBOT_TOOL_NAMES, SPLIT_EXTRACT_TYPE } from '../constants';
import {
  setIsErrorFlag,
  setLatestToolCalling,
  setMessageRestriction,
  setSplitExtractPages,
  selectors as editorChatBotSelectors,
} from '../slices';
import { getRestrictionMessage } from '../utils/getRestrictionMessage';
import { handleMessageSplit, handleSplitEqualType } from '../utils/handleSplitEqual';
import { handleStorageMerge } from '../utils/handleStorageMerge';

export async function onToolCall({
  toolCall,
  t,
  callback,
  handleSyncThirdParty,
  currentDocument,
}: {
  toolCall: { toolName: string; args: unknown };
  t: TFunction;
  callback: () => void;
  handleSyncThirdParty: () => void;
  currentDocument: IDocumentBase;
}) {
  try {
    store.dispatch(setLatestToolCalling(toolCall.toolName));
    const restrictionMessage = await getRestrictionMessage({ toolCall, t });
    if (restrictionMessage) {
      store.dispatch(setMessageRestriction(restrictionMessage));
      store.dispatch(setIsErrorFlag(true));
      return `Response user with this message: "${restrictionMessage}"`;
    }

    switch (toolCall.toolName) {
      case CHATBOT_TOOL_NAMES.TEXT_DECORATION: {
        const args = toolCall.args as {
          type: 'underline' | 'strike-through' | 'squiggly';
          data: Array<{ text: string; page: number; isShowingReference: boolean }>;
          color: string;
        };
        return await textDecoration(args.type, args.data, args.color);
      }
      case CHATBOT_TOOL_NAMES.HIGHLIGHT: {
        const args = toolCall.args as {
          data: Array<{ text: string; page: number; isShowingReference: boolean }>;
          color: string;
        };
        return await highlightText(args.data, args.color);
      }
      case CHATBOT_TOOL_NAMES.REDACT: {
        const args = toolCall.args as { data: Array<{ text: string; page: number }> };
        return await redact(args.data);
      }
      case CHATBOT_TOOL_NAMES.DELETE_PAGE: {
        const args = toolCall.args as { pageRange: number[] };
        if (args.pageRange.length > core.getTotalPages()) {
          return `Response user with this message: "It looks like you're trying to delete pages that don't exist in the document. Please check the page number and try again."`;
        }
        if (args.pageRange.length === core.getTotalPages()) {
          return `Response user with this message: "It looks like you're trying to delete all the pages. I can’t remove everything, but I can help delete specific pages if you’d like."`;
        }
        return await deletePage({ pageRange: args.pageRange, currentDocument });
      }
      case CHATBOT_TOOL_NAMES.INSERT_BLANK_PAGE: {
        const args = toolCall.args as { page: number };
        return await insertBlankPage(args.page);
      }
      case CHATBOT_TOOL_NAMES.MOVE_PAGE: {
        const args = toolCall.args as { page_from: number; page_to: number };
        return await movePage({ current: args.page_from, target: args.page_to, currentDocument });
      }
      case CHATBOT_TOOL_NAMES.ROTATE_PAGE: {
        const args = toolCall.args as { pageRange: number[]; angles: number[] };
        return await rotatePage({
          pages: args.pageRange,
          angles: args.angles,
          currentDocument,
        });
      }
      case CHATBOT_TOOL_NAMES.GET_TEXT_COORDINATES: {
        const args = toolCall.args as { page: number; text: string };
        return await getTextCoordinates(args.page, args.text);
      }
      case CHATBOT_TOOL_NAMES.ADD_SHAPE: {
        const args = toolCall.args as {
          page: number;
          shape: { type: 'rectangle' | 'circle'; x: number; y: number; width: number; height: number };
        };
        return await createShapeAnnot(args);
      }
      case CHATBOT_TOOL_NAMES.DOWNLOAD: {
        return await downloadFile(toolCall);
      }
      case CHATBOT_TOOL_NAMES.PRINT: {
        return await printPdf();
      }
      case CHATBOT_TOOL_NAMES.EDIT_TEXT: {
        return await editText(toolCall, currentDocument);
      }
      case CHATBOT_TOOL_NAMES.INSERT_OUTLINES: {
        return await insertOutlines({ toolCall, t, callback });
      }
      case CHATBOT_TOOL_NAMES.SPLIT_EXTRACT: {
        const args = toolCall.args as { pageRange: number[][]; splitType: string; requestedParts: number };

        if (args.requestedParts > core.getTotalPages()) {
          return `Response user with this message: "I apologize, but I cannot split the document into more files than total pages in the document. Please try again with a smaller number of files."`;
        }

        if (args.splitType === SPLIT_EXTRACT_TYPE.EQUAL) {
          const { pageRange: calculatedPageRange, numberFiles } = handleSplitEqualType(args.pageRange);
          store.dispatch(setSplitExtractPages(calculatedPageRange));
          const fileInfo = handleMessageSplit(calculatedPageRange);
          const messageResponse = `I have split the document into ${numberFiles} files.\n\n${fileInfo.join('')}`;
          toolCall.args = { ...args, pageRange: calculatedPageRange };
          return `Response user **exactly** this message: "${messageResponse}"`;
        }

        store.dispatch(setSplitExtractPages(args.pageRange));
        return 'Done';
      }
      case CHATBOT_TOOL_NAMES.MERGE_PAGE: {
        const args = toolCall.args as { position: string };
        const storageMergeMessage = handleStorageMerge(currentDocument, t);
        const uploadedFiles = editorChatBotSelectors.getMergeFiles(store.getState());
        if (storageMergeMessage) {
          return storageMergeMessage;
        }

        if (uploadedFiles.length === 0) {
          return `Response user with this message: "I apologize, but you need to upload file before merge"`;
        }
        return await mergePage({
          position: args.position,
          handleSyncThirdParty,
          currentDocument,
          t,
          uploadedFiles,
        });
      }
      case CHATBOT_TOOL_NAMES.ADD_COMMENTS: {
        const args = toolCall.args as { text: string; page: number; color: string; comment: string };
        return await addComments({
          text: args.text,
          page: args.page,
          color: args.color,
          comment: args.comment,
        });
      }
      default:
        return 'Unknown tool called';
    }
  } catch (error) {
    logger.logError({
      error: error as Error,
      message: 'Error calling tool',
      reason: LOGGER.Service.EDITOR_CHATBOT,
    });
    return `Response user with this message: "There was an error generating the response. Please try again"`;
  }
}
