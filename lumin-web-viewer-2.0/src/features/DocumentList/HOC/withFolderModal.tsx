import React, { useState } from 'react';

import InfoModal from 'luminComponents/InfoModal';
import ModalFolder from 'luminComponents/ModalFolder';

import { FolderAction, FolderLocationTypeMapping } from 'constants/folderConstant';
import { INFO_MODAL_TYPE } from 'constants/lumin-common';

import { IFolder } from 'interfaces/folder/folder.interface';

type GenericFunctionComponent<P> = (props: P) => React.ReactElement;

export type FolderSettingModalType = {
  mode: typeof FolderAction[keyof typeof FolderAction];
  folder: IFolder;
};

export interface ExtendedFolderModalProps {
  openFolderModal: React.Dispatch<React.SetStateAction<FolderSettingModalType>>;
}

const withFolderModal =
  <P,>(
    WrappedComponent: GenericFunctionComponent<P>
  ): GenericFunctionComponent<Omit<P, keyof ExtendedFolderModalProps>> =>
  (props: P) => {
    const [settingModal, setSettingModal] = useState<FolderSettingModalType | null>(null);

    const onClose = () => setSettingModal((prevState) => ({ ...prevState, mode: null }));

    const renderModals = () => {
      if (!settingModal || !settingModal?.folder) {
        return null;
      }

      const { mode, folder } = settingModal;
      switch (mode) {
        case FolderAction.INFO:
          return <InfoModal open modalType={INFO_MODAL_TYPE.FOLDER} currentTarget={folder} closeDialog={onClose} />;
        case FolderAction.EDIT: {
          const folderType = FolderLocationTypeMapping[folder.belongsTo.type];
          return <ModalFolder.Edit folder={folder} type={folderType} onClose={onClose} />;
        }
        default:
          return null;
      }
    };

    return (
      <>
        <WrappedComponent openFolderModal={setSettingModal} {...props} />
        {renderModals()}
      </>
    );
  };

export default withFolderModal;
