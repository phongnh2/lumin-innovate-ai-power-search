import { CHECKBOX_TYPE } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';

import { HandleSelectedItems } from './useSelectItems';

const useClickMenu = ({
  item,
  handleSelectedItems,
  shiftHoldingRef,
  lastSelectedDocIdRef,
}: {
  item: IFolder | IDocumentBase;
  shiftHoldingRef: React.MutableRefObject<boolean>;
  lastSelectedDocIdRef: React.MutableRefObject<string>;
  handleSelectedItems: ({ currentItem, lastSelectedDocId, checkboxType }: HandleSelectedItems) => void;
}) => {
  const onClickMenu = () => {
    if (!shiftHoldingRef.current) {
      lastSelectedDocIdRef.current = item._id;
    }
    handleSelectedItems({
      currentItem: item,
      lastSelectedDocId: lastSelectedDocIdRef.current,
      checkboxType: CHECKBOX_TYPE.SELECT_ONE ,
    });
  };
  return {
    onClickMenu,
  };
};

export default useClickMenu;
