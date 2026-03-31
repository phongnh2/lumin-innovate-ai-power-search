import produce from 'immer';
import { AnyAction } from 'redux';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import { documentGraphServices } from 'services/graphServices';

import logger from 'helpers/logger';

import errorExtract from 'utils/error';

import { LOGGER } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { SocketOutlineDeleted } from './SocketOutlineDeleted';
import { SocketOutlineEdited } from './SocketOutlineEdited';
import { SocketOutlineInserted } from './SocketOutlineInserted';
import { ISocketOutlineManipulation } from './SocketOutlineManipulation';
import { SocketOutlineMoved } from './SocketOutlineMoved';
import { OutlineActionType, TUpdateDocumentOutlinesParams } from '../types';
import { OutlineStoreUtils } from '../utils/outlineStore.utils';
import { OutlineTransformerUtils } from '../utils/outlineTransformer.utils';

const { dispatch } = store;

const fetchDocumentOutlines = async (currentDocument: IDocumentBase) => {
  const arrOutline = await documentGraphServices.getDocumentOutlines({ documentId: currentDocument._id });
  const outline = OutlineTransformerUtils.convertToNestedOutline(arrOutline);
  OutlineStoreUtils.setOutlines(outline);
};

const updateDocumentOutlines = (data: TUpdateDocumentOutlinesParams) => {
  const rootTree = selectors.getOutlines(store.getState());
  if (!rootTree) {
    return;
  }

  let operation: ISocketOutlineManipulation;
  switch (data.action) {
    case OutlineActionType.Insert: {
      operation = new SocketOutlineInserted(rootTree);
      break;
    }
    case OutlineActionType.Delete: {
      operation = new SocketOutlineDeleted(rootTree);
      break;
    }
    case OutlineActionType.Edit: {
      operation = new SocketOutlineEdited(rootTree);
      break;
    }
    case OutlineActionType.Move: {
      operation = new SocketOutlineMoved(rootTree);
      break;
    }
    default:
      break;
  }

  const root = operation.refreshOutline(data);
  OutlineStoreUtils.setOutlines(root);
};

export const onOutlinesUpdated = async (data: TUpdateDocumentOutlinesParams) => {
  const currentDocument = selectors.getCurrentDocument(store.getState());
  const shouldRefreshOutlines = data.action === OutlineActionType.Refresh;
  if (currentDocument.metadata?.hasOutlines && !shouldRefreshOutlines) {
    updateDocumentOutlines(data);
    return;
  }

  try {
    dispatch(actions.setIsLoadingDocumentOutlines(true) as AnyAction);
    await fetchDocumentOutlines(currentDocument);
    if (!currentDocument.metadata?.hasOutlines) {
      const newDocument = produce(currentDocument, (draft) => {
        draft.metadata.hasOutlines = true;
      });
      dispatch(actions.setCurrentDocument(newDocument) as AnyAction);
    }
  } catch (error) {
    const { message } = errorExtract.extractGqlError(error) as { message: string };
    logger.logError({ reason: LOGGER.Service.OUTLINE_ERROR, error: error as Error, message });
  } finally {
    dispatch(actions.setIsLoadingDocumentOutlines(false) as AnyAction);
  }
};
