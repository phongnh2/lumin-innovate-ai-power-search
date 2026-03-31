import { ButtonSize, Button, ButtonVariant, Text, Select, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { memo, useEffect } from 'react';
import { useSelector } from 'react-redux';

import SemanticWarning from 'luminComponents/SemanticWarning';

import { useConvertToOfficeFile } from 'hooks/useConvertToOfficeFile';
import useDocumentTools from 'hooks/useDocumentTools';
import { useTranslation } from 'hooks/useTranslation';

import { eventTracking } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import CompressPdf from 'features/CompressPdf';
import CompressOptionsModal from 'features/CompressPdf/components/CompressOptionsModal';
import CompressOptionsHeader from 'features/CompressPdf/components/CompressOptionsModal/CompressOptionsHeader';
import { compressPdfSelectors } from 'features/CompressPdf/slices';
import { getDownloadModalData } from 'features/EnableToolFromQueryParams/utils';
import { FlattenPdf } from 'features/FlattenPdf';

import { DownloadType } from 'constants/downloadPdf';
import UserEventConstants from 'constants/eventConstants';
import { STORAGE_TYPE } from 'constants/lumin-common';

import { ISaveAsModalLayoutProps } from '../../SaveAsModal.interface';

import * as Styled from './SaveAsModaLayout.styled';

const SaveAsModalLayout = (props: ISaveAsModalLayoutProps) => {
  const {
    isWarningType,
    canSaveToGoogleDrive,
    isOpen,
    type,
    options,
    optionsMapper,
    openedElementData,
    actionQuery,
    handleCloseSaveAsModal,
    handleClickItem,
    handleSaveOnComputer,
    setSyncFileTo,
    handleResetData,
  } = props;
  const { t } = useTranslation();

  const { officeDownloadTypes, canConvertToOfficeFile } = useConvertToOfficeFile();

  const isEditingCompressOptions = useSelector(compressPdfSelectors.getIsEditingCompressOptions);

  const { handleDocStack } = useDocumentTools();

  const { title, subTitle } = getDownloadModalData({
    actionQuery,
    openedElementData,
  });
  const trackingData = {
    modalName: ModalName.DOWNLOAD_DOCUMENT,
    modalPurpose: ModalPurpose[ModalName.DOWNLOAD_DOCUMENT],
  };

  useEffect(() => {
    if (openedElementData.source) {
      modalEvent.modalViewed(trackingData).catch(() => {});
    }
  }, [openedElementData.source]);

  const renderFormatSelection = () => (
    <Select
      size="lg"
      value={type}
      onChange={(value) => handleClickItem(value)}
      rightSection={
        <Icomoon type="caret-down-filled-sm" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)" />
      }
      leftSection={<Icomoon type={optionsMapper[type].icon} size="lg" />}
      data={options.map((option) => ({
        value: option.type,
        label: option.title,
        disabled: officeDownloadTypes.includes(option.type) && !canConvertToOfficeFile,
      }))}
      renderOption={(item) => (
        <>
          <Icomoon type={optionsMapper[item.option.value].icon} size="lg" />
          <Text type="label" size="md" color="var(--kiwi-colors-core-on-primary-container)">
            {item.option.label}
          </Text>
        </>
      )}
    />
  );

  const onClose = () => {
    modalEvent.modalDismiss(trackingData).catch(() => {});
    handleCloseSaveAsModal();
  };

  const handleTransitionEnd = () => {
    if (!isOpen) {
      handleResetData();
    }
  };

  return (
    <Styled.Modal
      size="md"
      opened={isOpen}
      onClose={onClose}
      withCloseButton={!isEditingCompressOptions}
      headerTitle={isEditingCompressOptions ? <CompressOptionsHeader /> : title}
      onTransitionEnd={handleTransitionEnd}
    >
      {isEditingCompressOptions ? (
        <CompressOptionsModal />
      ) : (
        <Styled.Container>
          <Styled.ContentContainer>
            <Styled.SubTitle>{subTitle}</Styled.SubTitle>
            {renderFormatSelection()}
            {isWarningType && (
              <SemanticWarning
                content={
                  <Text type="body" size="md">
                    {t('viewer.downloadModal.warning')}
                  </Text>
                }
              />
            )}
            {type === DownloadType.PDF && <FlattenPdf />}
          </Styled.ContentContainer>

          <CompressPdf />

          <Styled.FooterContainer>
            <Button
              data-lumin-btn-name={ButtonName.SAVE_TO_DRIVE}
              onClick={() => {
                modalEvent.modalConfirmation(trackingData).catch(() => {});
                eventTracking(UserEventConstants.EventType.CLICK, {
                  elementName: ButtonName.SAVE_TO_DRIVE,
                  elementPurpose: ButtonPurpose[ButtonName.SAVE_TO_DRIVE],
                }).catch(() => {});
                setSyncFileTo(STORAGE_TYPE.GOOGLE);
              }}
              disabled={canSaveToGoogleDrive}
              size={ButtonSize.lg}
              variant={ButtonVariant.text}
            >
              {t('viewer.downloadModal.saveToDrive')}
            </Button>
            <Button
              data-lumin-btn-name={ButtonName.SAVE_ON_COMPUTER}
              onClick={() => {
                modalEvent.modalConfirmation(trackingData).catch(() => {});
                eventTracking(UserEventConstants.EventType.CLICK, {
                  elementName: ButtonName.SAVE_ON_COMPUTER,
                  elementPurpose: ButtonPurpose[ButtonName.SAVE_ON_COMPUTER],
                }).catch(() => {});
                handleDocStack({
                  callback: () => {
                    handleSaveOnComputer();
                  },
                  action: UserEventConstants.Events.HeaderButtonsEvent.DOWNLOAD,
                })().catch(() => {});
              }}
              size={ButtonSize.lg}
              variant={ButtonVariant.tonal}
            >
              {t('viewer.downloadModal.saveToComputer')}
            </Button>
          </Styled.FooterContainer>
        </Styled.Container>
      )}
    </Styled.Modal>
  );
};

export default memo(SaveAsModalLayout);
