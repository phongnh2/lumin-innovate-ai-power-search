import { shallowEqual, useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import { isSyncableFile } from 'helpers/autoSync';

import { TOOLS_NAME } from 'constants/toolsName';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

function useAutoSavePageTools(): boolean {
  const currentDocument = useSelector<unknown, IDocumentBase>(selectors.getCurrentDocument, shallowEqual);
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const toolMode = core.docViewer.getToolMode();
  const isCropTool = toolMode.name === TOOLS_NAME.CROP_PAGE;

  return Boolean(currentDocument && isSyncableFile(currentDocument) && currentUser && !isCropTool);
}

export { useAutoSavePageTools };
