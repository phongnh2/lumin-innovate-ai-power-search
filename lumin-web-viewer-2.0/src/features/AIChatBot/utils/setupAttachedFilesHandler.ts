import { AnyAction } from 'redux';

import actions from 'actions';
import { AppDispatch } from 'store';

import logger from 'helpers/logger';

import { DataElements } from 'constants/dataElement';
import { LOGGER } from 'constants/lumin-common';

import { ChatbotLoadAttachedFilesHandler } from './loadAttachedFilesHandler';
import { AttachedFileType } from '../interface';

export const setupAttachedFilesHandler = ({
  uploadingDocuments,
  abortControllers,
  dispatch,
}: {
  uploadingDocuments: AttachedFileType[];
  abortControllers?: Map<string, AbortController>;
  dispatch: AppDispatch;
}) =>
  new ChatbotLoadAttachedFilesHandler()
    .setAttachedFiles(uploadingDocuments)
    .setDocumentIdAbortControllers(abortControllers)
    .setOnSetupPasswordHandler(({ attempt, name }) => {
      dispatch(actions.openElement(DataElements.PASSWORD_MODAL) as AnyAction);
      dispatch(actions.setPasswordProtectedDocumentName(name) as AnyAction);
      dispatch(actions.setPasswordAttempts(attempt) as AnyAction);
    })
    .setOnLoadDocumentComplete(() => {
      dispatch(actions.closeElement(DataElements.PASSWORD_MODAL) as AnyAction);
      dispatch(actions.setPasswordProtectedDocumentName('') as AnyAction);
    })
    .setOnError((error) => {
      logger.logError({ reason: LOGGER.Service.AI_CHATBOT, error });
    });
