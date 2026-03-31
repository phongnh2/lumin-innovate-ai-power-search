import { Icomoon, IconButton, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useState, useMemo } from 'react';

import ModalFolder from 'lumin-components/ModalFolder';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import docActionsEvent from 'utils/Factory/EventCollection/DocActionsEventCollection';

import { MAXIMUM_FOLDER_DEPTH } from 'constants/folderConstant';

import { useCreateFolderButtonState } from './hook';

const CreateFolderButton = () => {
  const { t } = useTranslation();
  const [isOpenCreateFolderModal, setIsOpenCreateFolderModal] = useState(false);

  const { isOffline, hasReachedDepthLimit, hasReachedLimit, isLoading, creatable, documentFolderType } =
    useCreateFolderButtonState();

  const toggleCreateFolderModal = () => {
    docActionsEvent
      .click({
        elementName: ButtonName.CREATE_FOLDER,
      })
      .catch(() => {});
    setIsOpenCreateFolderModal((prevState) => !prevState);
  };

  const limitTooltipContent = useMemo(() => {
    if (hasReachedDepthLimit) {
      return t('folderSection.tooltipCreateDepthLimit', { depthLimit: MAXIMUM_FOLDER_DEPTH + 1 });
    }
    if (hasReachedLimit) {
      return t('folderSection.tooltipCreateLimit');
    }
    return t('folderSection.tooltipCreateActive');
  }, [hasReachedLimit, hasReachedDepthLimit, t]);

  const isCreateFolderDisabled = hasReachedLimit || isLoading || hasReachedDepthLimit || isOffline;

  return (
    <>
      {creatable ? (
        <PlainTooltip
          zIndex="var(--zindex-kiwi-modal-low)"
          position="bottom-end"
          content={limitTooltipContent}
          disabled={isOffline}
        >
          <IconButton
            size="lg"
            data-cy="create_folder_button"
            disabled={isCreateFolderDisabled}
            icon={<Icomoon type="folder-plus-lg" size="lg" />}
            onClick={toggleCreateFolderModal}
          />
        </PlainTooltip>
      ) : null}
      {isOpenCreateFolderModal && <ModalFolder.Creation type={documentFolderType} onClose={toggleCreateFolderModal} />}
    </>
  );
};

export default CreateFolderButton;
