import { TFunction } from 'i18next';
import produce from 'immer';
import { AnyAction } from 'redux';

import toastUtils from '@new-ui/utils/toastUtils';

import actions from 'actions';
import selectors from 'selectors';
import { store } from 'store';

import fireEvent from 'helpers/fireEvent';

import { useChatbotStore } from 'features/EditorChatBot/hooks/useChatbotStore';
import { AiOutlineManager } from 'features/Outline/utils/aiOutlineManager';
import { OutlineStoreUtils } from 'features/Outline/utils/outlineStore.utils';

import { CUSTOM_EVENT } from 'constants/customEvent';

const { dispatch } = store;

type InsertOutlinesArgs = {
  data: {
    name: string;
    level: number;
    pageNumber?: number;
  }[];
};

const insertOutlinesToDocument = async ({
  toolCall,
  t,
}: {
  toolCall: { toolName: string; args: unknown };
  t: TFunction;
}) => {
  const { data = [] } = (toolCall?.args || {}) as InsertOutlinesArgs;
  const state = store.getState();
  const rootTree = selectors.getOutlines(state);
  const currentDocument = selectors.getCurrentDocument(state);
  const hasOutlines = currentDocument?.metadata?.hasOutlines;
  const aiOutlineManager = new AiOutlineManager(rootTree, currentDocument._id, hasOutlines);
  const outlineNodeList = aiOutlineManager.insertOutlines(data);
  useChatbotStore.getState().setHasGeneratedOutlines(false);
  const nodeList = hasOutlines ? outlineNodeList : OutlineStoreUtils.getNodeListFromRoot(rootTree);
  await OutlineStoreUtils.insertMultipleOutlineNode(nodeList);
  if (!hasOutlines) {
    const newDocument = produce(currentDocument, (draft) => {
      draft.metadata.hasOutlines = true;
    });
    dispatch(actions.updateCurrentDocument(newDocument) as AnyAction);
  }

  fireEvent(CUSTOM_EVENT.OUTLINE_CHANGED);
  toastUtils.success({
    message: t('viewer.chatbot.outlines.insertOutlinesSuccessfully'),
  });
  return t('viewer.chatbot.outlines.insertOutlinesSuccessfully');
};

export async function insertOutlines({
  toolCall,
  t,
  callback,
}: {
  toolCall: { toolName: string; args: unknown };
  t: TFunction;
  callback: () => void;
}): Promise<string> {
  const assistantMessage = await insertOutlinesToDocument({ toolCall, t });
  callback();
  return `Please response user with this message: ${assistantMessage}`;
}
