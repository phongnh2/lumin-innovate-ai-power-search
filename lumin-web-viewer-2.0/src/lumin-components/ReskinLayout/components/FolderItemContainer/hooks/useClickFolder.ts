import React, { useCallback } from 'react';

import { HandleSelectedItems } from 'hooks/useSelectItems/useSelectItems';

import { CHECKBOX_TYPE } from 'constants/lumin-common';

import { IFolder } from 'interfaces/folder/folder.interface';

const useClickFolder = ({
  folder,
  shiftHoldingRef,
  lastSelectedDocIdRef,
  handleSelectedItems,
}: {
  folder: IFolder;
  shiftHoldingRef: React.MutableRefObject<boolean>;
  lastSelectedDocIdRef: React.MutableRefObject<string>;
  handleSelectedItems: ({
    currentItem,
    lastSelectedDocId,
    checkboxType,
  }: HandleSelectedItems) => void;
}) => {
  const selectDocuments = useCallback((selected: boolean) => {
    const type = selected ? CHECKBOX_TYPE.SELECT : CHECKBOX_TYPE.DESELECT;
    if (!shiftHoldingRef.current) {
      lastSelectedDocIdRef.current = folder._id;
    }
    handleSelectedItems({
      currentItem: folder,
      lastSelectedDocId: lastSelectedDocIdRef.current,
      checkboxType: type,
    });
  }, []);

  const onCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    selectDocuments(e.target.checked);
  }, [selectDocuments]);
  return { onCheckboxChange };
};

export default useClickFolder;