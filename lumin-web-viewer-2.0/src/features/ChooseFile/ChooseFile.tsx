import { Dialog, Text, Button, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

import actions from 'actions';

import SvgElement from 'luminComponents/SvgElement';
import UploadPopper from 'luminComponents/TopFeaturesSection/components/UploadPopper';

import { useExpiredDocumentModal, useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { folderType } from 'constants/documentConstants';
import { ModalTypes } from 'constants/lumin-common';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { ChooseFileProvider } from './ChooseFileProvider';
import ChooseFileList from './components/ChooseFileList';
import LocationBreadcrumb from './components/LocationBreadcrumb';
import LocationList from './components/LocationList';
import SearchBar from './components/SearchBar';
import { useChooseFileContext, useGetOrganizationResources, useTrackingModalEvent } from './hooks';

import styles from './ChooseFile.module.scss';

type ChooseFileProps = {
  setOpened: (value: boolean) => void;
};

const ChooseFile = ({ setOpened }: ChooseFileProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const { getMoreInSearching } = useGetOrganizationResources();

  const { state: chooseFileState } = useChooseFileContext();

  const { getExpiredModalContent } = useExpiredDocumentModal();

  useTrackingModalEvent();

  const onHandleDocumentOvertimeLimit = useCallback(
    (document: IDocumentBase) => {
      const modalContent = getExpiredModalContent(document);
      const setting = {
        ...modalContent,
        customIcon: <SvgElement content="new-warning" className="auto-margin" width={48} alt="modal_image" />,
        type: ModalTypes.WARNING,
        useReskinModal: true,
      };
      dispatch(actions.openModal(setting));
    },
    [dispatch, getExpiredModalContent]
  );

  const onComplete = useCallback(() => {
    const { selectedDocument } = chooseFileState;
    if (!selectedDocument) {
      return;
    }

    if (selectedDocument.isOverTimeLimit) {
      onHandleDocumentOvertimeLimit(selectedDocument);
      return;
    }
    navigate(`/viewer/${selectedDocument._id}`, { state: { previousPath: pathname } });
  }, [chooseFileState, navigate, onHandleDocumentOvertimeLimit, pathname]);

  const breadcrumbLength = chooseFileState.breadcrumbData.length;

  return (
    <Dialog opened onClose={() => setOpened(false)} size="md">
      <div className={styles.headerSection}>
        <Text type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
          {t('chooseFile.title')}
        </Text>
        <SearchBar />
        <LocationBreadcrumb />
      </div>
      <div className={styles.mainContent}>
        {breadcrumbLength === 0 && !chooseFileState.searchKey ? (
          <LocationList />
        ) : (
          <ChooseFileList getMoreInSearching={getMoreInSearching} />
        )}
      </div>
      <div className={styles.footer}>
        <UploadPopper
          isOnHomeEditAPdfFlow
          folder={breadcrumbLength > 1 ? chooseFileState.breadcrumbData[breadcrumbLength - 1] : null}
          folderType={chooseFileState.breadcrumbData[0]?.folderType || folderType.INDIVIDUAL}
          targetId={chooseFileState.breadcrumbData[0]?._id}
          afterPickFileCallback={() => setOpened(false)}
          uploadButtonWrapperClassName={styles.uploadButton}
        >
          <Button
            size="lg"
            variant="text"
            startIcon={<Icomoon size="lg" type="upload-lg" color="var(--kiwi-colors-core-secondary)" />}
            data-cy="choose_a_file_to_edit_upload_file"
            data-lumin-btn-name={ButtonName.UPLOAD_FILE_ON_CHOOSE_A_FILE_TO_EDIT}
          >
            {t('modalUploadDoc.uploadFile')}
          </Button>
        </UploadPopper>
        <div className={styles.actions}>
          <Button
            size="lg"
            variant="outlined"
            onClick={() => setOpened(false)}
            data-cy="choose_a_file_to_edit_close_modal"
          >
            {t('common.cancel')}
          </Button>
          <Button
            size="lg"
            variant="filled"
            disabled={!chooseFileState.selectedDocument}
            onClick={onComplete}
            data-cy="choose_a_file_to_edit_choose_file"
          >
            {t('common.choose')}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

const ChooseFileWrapper = (props: ChooseFileProps) => (
  <ChooseFileProvider>
    <ChooseFile {...props} />
  </ChooseFileProvider>
);

export default ChooseFileWrapper;
