import React from 'react';
import { Trans } from 'react-i18next';

import { documentServices } from 'services';

import { toastUtils } from 'utils';

import { CHECKBOX_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';

const useMoveDocuments = () => {
  const getId = (item: IDocumentBase) => item._id;

  const getMoveDocumentIds = (documentList: IDocumentBase[], currentUserId: string) => {
    const hasNotOwnedDocument = documentList.some((element) => element.ownerId !== currentUserId);
    return {
      hasNotOwnedDocument,
      moveDocumentIds: documentList.map(getId),
    };
  };

  const moveDocumentsToFolder = async ({
    onDragMovingFile,
    documentIds,
    name,
    folder,
    setRemoveDocList,
  }: {
    onDragMovingFile: (_name: string, _countMoveFile: number, _toggle: boolean) => void;
    documentIds: string[];
    name: string;
    folder: IFolder;
    setRemoveDocList: (args: { data?: IDocumentBase[]; type: string }) => void;
  }) => {
    try {
      onDragMovingFile(name, documentIds.length, true);
      await documentServices.moveDocumentsToFolder({
        documentIds,
        folderId: folder._id,
        isNotify: true,
      });
      toastUtils
        .success({
          message:
            documentIds.length > 1 ? (
              <Trans
                i18nKey="modalMove.moveDocsToFolder"
                components={{ b: <b className="bold" /> }}
                values={{ name, total: documentIds.length }}
              />
            ) : (
              <Trans i18nKey="modalMove.moveDocToFolder" components={{ b: <b className="bold" /> }} values={{ name }} />
            ),
          useReskinToast: true,
        })
        .finally(() => {});
    } catch (_) {
      toastUtils.openUnknownErrorToast();
    } finally {
      setRemoveDocList({ type: CHECKBOX_TYPE.DELETE });
      onDragMovingFile(name, documentIds.length, false);
    }
  };

  return { getId, getMoveDocumentIds, moveDocumentsToFolder };
};

export default useMoveDocuments;
