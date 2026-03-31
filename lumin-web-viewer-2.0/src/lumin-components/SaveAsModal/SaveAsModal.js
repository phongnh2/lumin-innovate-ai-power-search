import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { TriggerDownloadDocumentSource } from 'luminComponents/SaveAsModal/constant';

import { useGetValueDownloadOfficeType } from 'hooks/growthBook/useGetValueDownloadOfficeType';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';
import { useUrlSearchParams } from 'hooks/useUrlSearchParams';

import downloadPdf from 'helpers/downloadPdf';

import { eventTracking, toastUtils } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { COMPRESS_RESOLUTION } from 'features/CompressPdf/constants';
import { useProcessingCompressPdf } from 'features/CompressPdf/hooks/useProcessingCompressPdf';
import { compressPdfActions, compressPdfSelectors } from 'features/CompressPdf/slices';
import useCheckPermission from 'features/DocumentUploadExternal/useCheckPermission';
import useRequestPermission from 'features/DocumentUploadExternal/useRequestPermission';
import { PdfAction } from 'features/EnableToolFromQueryParams/constants';
import { getDownloadType } from 'features/EnableToolFromQueryParams/utils';
import featureStoragePolicies, { AppFeatures } from 'features/FeatureConfigs/featureStoragePolicies';

import { StepPercentage } from 'constants/customConstant';
import { DataElements } from 'constants/dataElement';
import { extensions } from 'constants/documentType';
import { DownloadType } from 'constants/downloadPdf';
import UserEventConstants from 'constants/eventConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import SaveAsModalLayout from './components/SaveAsModalLayout';

const propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  openSaveToDriveModal: PropTypes.func.isRequired,
  currentDocument: PropTypes.object,
  openElement: PropTypes.func,
  setupViewerLoadingModal: PropTypes.func,
};

const defaultProps = {
  isOpen: false,
  onClose: () => {},
  currentDocument: {},
  openElement: () => {},
  setupViewerLoadingModal: () => {},
};

const getDocumentStyleWhiteList = (t) => ({
  [extensions.PDF]: {
    icon: 'ph-file-pdf',
    title: t('viewer.downloadModal.pdfDocument'),
    type: extensions.PDF,
  },
  [extensions.DOCX]: {
    icon: 'ph-microsoft-word-logo',
    title: t('viewer.downloadModal.wordDocument'),
    type: extensions.DOCX,
  },
  [extensions.XLSX]: {
    icon: 'ph-microsoft-excel-logo',
    title: t('viewer.downloadModal.excelDocument'),
    type: extensions.XLSX,
  },
  [extensions.PPTX]: {
    icon: 'ph-microsoft-powerpoint-logo',
    title: t('viewer.downloadModal.powerPointDocument'),
    type: extensions.PPTX,
  },
  [extensions.JPG]: {
    icon: 'file-type-jpg-lg',
    title: t('viewer.downloadModal.jpgImage'),
    type: extensions.JPG,
  },
  [extensions.PNG]: {
    icon: 'file-type-png-lg',
    title: t('viewer.downloadModal.pngImage'),
    type: extensions.PNG,
  },
});

const getDocumentStyle = (t) => ({
  [extensions.PDF]: {
    icon: 'ph-file-pdf',
    title: t('viewer.downloadModal.pdfDocument'),
    type: extensions.PDF,
  },
  [extensions.DOCX]: {
    icon: 'ph-microsoft-word-logo',
    title: t('viewer.downloadModal.wordDocument'),
    type: extensions.DOCX,
  },
  [extensions.JPG]: {
    icon: 'file-type-jpg-lg',
    title: t('viewer.downloadModal.jpgImage'),
    type: extensions.JPG,
  },
  [extensions.PNG]: {
    icon: 'file-type-png-lg',
    title: t('viewer.downloadModal.pngImage'),
    type: extensions.PNG,
  },
});

const eventTrackingDownloadType = {
  [DownloadType.PDF]: ButtonName.SAVE_AS_PDF,
  [DownloadType.DOCX]: ButtonName.SAVE_AS_DOCX,
  [DownloadType.XLSX]: ButtonName.SAVE_AS_XLSX,
  [DownloadType.PPTX]: ButtonName.SAVE_AS_PPTX,
  [DownloadType.JPG]: ButtonName.SAVE_AS_JPG,
  [DownloadType.PNG]: ButtonName.SAVE_AS_PNG,
};

const SaveAsModal = (props) => {
  const { isOpen, onClose, openSaveToDriveModal, currentDocument, openElement, setupViewerLoadingModal } = props;
  const dispatch = useDispatch();
  const [syncFileTo, setSyncFileTo] = useState(STORAGE_TYPE.S3);
  const [type, setType] = useState(extensions.PDF);
  const { t } = useTranslation();
  const requestPermission = useRequestPermission(syncFileTo);
  const checkPermission = useCheckPermission(syncFileTo);
  const openedElementData = useShallowSelector((state) =>
    selectors.getOpenedElementData(state, DataElements.SAVE_AS_MODAL)
  );
  const searchParams = useUrlSearchParams();
  const actionQuery = searchParams.get(UrlSearchParam.ACTION);

  const compressPdfLevel = useSelector(compressPdfSelectors.getCompressLevel);
  const { compressPdfCallback } = useProcessingCompressPdf({ compressLevel: compressPdfLevel });
  const isSaveToDriveModalOpen = useSelector((state) => selectors.isElementOpen(state, DataElements.SAVE_TO_DRIVE));
  const { isExportDocumentToDifferentFormat } = useGetValueDownloadOfficeType();
  const flattenPdf = useSelector(selectors.isFlattenPdf);

  const canSaveToGoogleDrive = featureStoragePolicies.isFeatureEnabledForStorage(
    AppFeatures.SAVE_TO_GG_DRIVE,
    currentDocument.service
  );
  const isWarningType = [extensions.DOCX, extensions.XLSX, extensions.PPTX].includes(type);

  const handleResetData = () => {
    setSyncFileTo(STORAGE_TYPE.S3);
    setType(extensions.PDF);
    dispatch(compressPdfActions.setIsEditingCompressOptions(false));
    dispatch(actions.setDownloadType(extensions.PDF));
  };

  const handleCloseSaveAsModal = useCallback(() => {
    dispatch(actions.setFlattenPdf(false));
    onClose();
  }, []);

  const hasPermissionCallback = () => {
    dispatch(actions.setFlattenPdf(flattenPdf));
    openSaveToDriveModal();
  };

  const getStatus = (progress) => {
    if (progress >= 0 && progress <= StepPercentage.InitializeJob) {
      return t('viewer.downloadModal.creatingJob');
    }
    if (progress > StepPercentage.InitializeJob && progress < StepPercentage.ProcessingFile) {
      return t('viewer.downloadModal.processingFile');
    }
    return t('viewer.downloadModal.preparing');
  };

  const handleSaveOnComputer = useCallback(async () => {
    openElement(DataElements.VIEWER_LOADING_MODAL);
    setupViewerLoadingModal({
      totalSteps: 100,
      renderStatus: getStatus,
      isShowPercentage: true,
      circularSize: 108,
      variant: 'download',
    });
    handleCloseSaveAsModal();
    await downloadPdf(dispatch, {
      downloadType: type,
      filename: currentDocument.name,
      currentFileSize: currentDocument.size,
      compressLevel: compressPdfLevel,
      compressPdfCallback,
      flattenPdf,
    });
  }, [type, compressPdfLevel, flattenPdf, currentDocument.name]);

  const checkSessionOfInternalStorage = async () => {
    if (!checkPermission()) {
      requestPermission(hasPermissionCallback, () => {
        toastUtils.error({
          message: t('viewer.header.failedToSyncYourDocument'),
        });
      });
      return;
    }
    hasPermissionCallback();
  };

  const handleClickItem = useCallback((selectedType, callback) => {
    eventTracking(UserEventConstants.EventType.CLICK, {
      elementName: eventTrackingDownloadType[selectedType],
      elementPurpose: ButtonPurpose[eventTrackingDownloadType[selectedType]],
    });
    setType(selectedType);
    dispatch(actions.setDownloadType(selectedType));
    dispatch(compressPdfActions.setCompressLevel(COMPRESS_RESOLUTION.NONE));
    if (callback) {
      callback();
    }
  }, []);

  const documentStyleArray = useMemo(
    () =>
      Object.entries(isExportDocumentToDifferentFormat ? getDocumentStyleWhiteList(t) : getDocumentStyle(t)).map(
        ([key, { title, icon, type }]) => ({
          key,
          title,
          icon,
          type,
          itemProps: { sx: { height: '40px' }, icon, iconSize: 20 },
        })
      ),
    [t, isExportDocumentToDifferentFormat]
  );

  const optionsMapper = useMemo(
    () => (isExportDocumentToDifferentFormat ? getDocumentStyleWhiteList(t) : getDocumentStyle(t)),
    [t, isExportDocumentToDifferentFormat]
  );

  useEffect(() => {
    if (syncFileTo === STORAGE_TYPE.GOOGLE) {
      onClose();
      checkSessionOfInternalStorage();
    }
  }, [syncFileTo]);

  useEffect(() => {
    const defaultCompressLevel =
      actionQuery === PdfAction.COMPRESS ? COMPRESS_RESOLUTION.STANDARD : COMPRESS_RESOLUTION.NONE;

    if (isOpen) {
      const isFromLandingPage = openedElementData?.source === TriggerDownloadDocumentSource.LANDING_PAGE;
      if (isFromLandingPage) {
        if (actionQuery === PdfAction.FLATTEN_PDF) {
          dispatch(actions.setFlattenPdf(true));
        }
        dispatch(compressPdfActions.setCompressLevel(defaultCompressLevel));
        setType(getDownloadType(actionQuery));
        dispatch(actions.setDownloadType(getDownloadType(actionQuery)));
      }
    }
  }, [isOpen, actionQuery, dispatch, openedElementData]);

  return (
    <SaveAsModalLayout
      isWarningType={isWarningType}
      canSaveToGoogleDrive={canSaveToGoogleDrive}
      isOpen={isOpen}
      type={type}
      options={documentStyleArray}
      optionsMapper={optionsMapper}
      openedElementData={openedElementData}
      actionQuery={actionQuery}
      isSaveToDriveModalOpen={isSaveToDriveModalOpen}
      handleCloseSaveAsModal={handleCloseSaveAsModal}
      handleSaveOnComputer={handleSaveOnComputer}
      setSyncFileTo={setSyncFileTo}
      handleClickItem={handleClickItem}
      handleResetData={handleResetData}
    />
  );
};

SaveAsModal.propTypes = propTypes;
SaveAsModal.defaultProps = defaultProps;

export default SaveAsModal;
