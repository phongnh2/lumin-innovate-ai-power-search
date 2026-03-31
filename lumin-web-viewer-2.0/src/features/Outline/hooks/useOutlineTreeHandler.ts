import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ToolName } from 'core/type';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { RequestType } from 'luminComponents/RequestPermissionModal/requestType.enum';

import { useTranslation } from 'hooks';
import { useRequestPermissionChecker } from 'hooks/useRequestPermissionChecker';
import useShallowSelector from 'hooks/useShallowSelector';

import fireEvent from 'helpers/fireEvent';

import { CUSTOM_EVENT } from 'constants/customEvent';
import defaultTool from 'constants/defaultTool';
import { TOOLS_NAME } from 'constants/toolsName';

import { TDocumentOutline } from 'interfaces/document/document.interface';

import { TOutlineNode } from '../types';
import { TMoveOutlineHandler } from '../types/outlineTree';
import { OutlineStoreUtils } from '../utils/outlineStore.utils';

interface IAddOutlineProps {
  name: string;
  pageNumber: number;
  isAddSub?: boolean;
}

interface IModifyOutlineProps {
  name: string;
  pageNumber: number;
}

interface IMoveOutlineProps {
  dragOutline: TDocumentOutline;
  dropOutline: TDocumentOutline;
}

type TUseOutlineTreeHandlerPayload = {
  addOutline: (props: IAddOutlineProps) => void;
  removeOutline: () => void;
  modifyOutline: (props: IModifyOutlineProps) => void;
  activeOutlinePath: string;
  setActiveOutlinePath: Dispatch<SetStateAction<string>>;
  outlines: TOutlineNode[];
  moveOutlineBeforeTarget: TMoveOutlineHandler;
  moveOutlineAfterTarget: TMoveOutlineHandler;
  moveOutlineInward: TMoveOutlineHandler;
  requestAccessModalElement: JSX.Element;
  defaultOutline: { pageNumber?: number; textContent?: string } | null;
  setDefaultOutline: Dispatch<SetStateAction<{ pageNumber?: number; textContent?: string } | null>>;
};

export const useOutlineTreeHandler = (): TUseOutlineTreeHandlerPayload => {
  const dispatch = useDispatch();
  const outlineTree = useShallowSelector((state) => selectors.getOutlines(state));
  const [activeOutlinePath, setActiveOutlinePath] = useState<string | null>(null);
  const currentDocument = useSelector(selectors.getCurrentDocument);
  const { withEditPermission, requestAccessModalElement } = useRequestPermissionChecker({
    permissionRequest: RequestType.EDITOR,
  });
  const [defaultOutline, setDefaultOutline] = useState<{ pageNumber?: number; textContent?: string } | null>(null);
  const { t } = useTranslation();

  const getOutlineName = (name: string) => name || t('common.untitled');

  useEffect(() => {
    const onDocumentLoaded = () => {
      setActiveOutlinePath(null);
    };

    core.addEventListener('documentLoaded', onDocumentLoaded);
    return () => {
      core.removeEventListener('documentLoaded', onDocumentLoaded);
    };
  }, []);

  const tool = core.getTool(TOOLS_NAME.OUTLINE_DESTINATION as ToolName);

  const clearOutlineDestination = () => {
    core.setToolMode(defaultTool as ToolName);
    setActiveOutlinePath(null);
    dispatch(actions.setOutlineEvent(null));
    tool.clearOutlineDestination();
  };

  const triggerSaveOutlines = async () => {
    if (currentDocument.isSystemFile) {
      if (!currentDocument.unsaved) {
        dispatch(actions.setCurrentDocument({ ...currentDocument, unsaved: true }));
      }
      return;
    }

    await OutlineStoreUtils.importDocumentOutlines();
  };

  const addOutline = async ({ name, pageNumber, isAddSub }: IAddOutlineProps) => {
    await triggerSaveOutlines();
    OutlineStoreUtils.addOutline({
      name: getOutlineName(name),
      pageNumber,
      horizontalOffset: 0,
      verticalOffset: 0,
      activeOutlinePath,
      isAddSub,
    });
    fireEvent(CUSTOM_EVENT.OUTLINE_CHANGED, { addition: { isAddSub, activeOutlinePath } });
    clearOutlineDestination();
  };

  const modifyOutline = async ({ name, pageNumber }: IModifyOutlineProps) => {
    await triggerSaveOutlines();
    OutlineStoreUtils.modifyOutline({
      name: getOutlineName(name),
      pageNumber,
      x: 0,
      y: 0,
      activeOutlinePath,
    });
    fireEvent(CUSTOM_EVENT.OUTLINE_CHANGED);
    clearOutlineDestination();
  };

  const removeOutline = async () => {
    await triggerSaveOutlines();
    OutlineStoreUtils.deleteOutline({ activeOutlinePath });
    fireEvent(CUSTOM_EVENT.OUTLINE_CHANGED);
    clearOutlineDestination();
  };

  const moveOutlineBeforeTarget = async (props: IMoveOutlineProps) => {
    await triggerSaveOutlines();
    OutlineStoreUtils.moveOutlineBeforeTarget(props);
    fireEvent(CUSTOM_EVENT.OUTLINE_CHANGED);
    clearOutlineDestination();
  };

  const moveOutlineAfterTarget = async (props: IMoveOutlineProps) => {
    await triggerSaveOutlines();
    OutlineStoreUtils.moveOutlineAfterTarget(props);
    fireEvent(CUSTOM_EVENT.OUTLINE_CHANGED);
    clearOutlineDestination();
  };

  const moveOutlineInward = async (props: IMoveOutlineProps) => {
    await triggerSaveOutlines();
    OutlineStoreUtils.moveOutlineInward(props);
    fireEvent(CUSTOM_EVENT.OUTLINE_CHANGED);
    clearOutlineDestination();
  };

  return {
    addOutline: (props) => withEditPermission(() => addOutline(props))(),
    removeOutline: withEditPermission(removeOutline),
    modifyOutline: (props) => withEditPermission(() => modifyOutline(props))(),
    activeOutlinePath,
    setActiveOutlinePath,
    outlines: outlineTree.model.children,
    moveOutlineBeforeTarget: (props) => withEditPermission(() => moveOutlineBeforeTarget(props))(),
    moveOutlineAfterTarget: (props) => withEditPermission(() => moveOutlineAfterTarget(props))(),
    moveOutlineInward: (props) => withEditPermission(() => moveOutlineInward(props))(),
    requestAccessModalElement,
    defaultOutline,
    setDefaultOutline,
  };
};
