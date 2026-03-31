import { Button, ButtonSize, ButtonVariant } from 'lumin-ui/kiwi-ui';
import React from 'react';

import RightPanelProperty from '@new-ui/components/LuminRightPanel/components/RightPanelProperty';

import core from 'core';

import { useTranslation } from 'hooks/useTranslation';

import CropDimension from './components/CropDimension';
import CropPageRange from './components/CropPageRange';
import CropType from './components/CropType';
import { CropPanelProvider } from './CropPanelContext';
import { useAutoDrawCropArea } from './hooks/useAutoDrawCropArea';
import { useCleanupCropping } from './hooks/useCleanupCropping';
import { useCropManipulation } from './hooks/useCropManipulation';
import { useCropPanelStates } from './hooks/useCropPanelStates';
import { useCropPreviewInGridView } from './hooks/useCropPreviewInGridView';
import { getCropPageNumbers } from './utils/getCropPageNumbers';

import styles from './CropPanel.module.scss';

const PANEL_PROPERTIES = [
  {
    key: 'page-range',
    title: 'common.pageRange',
    component: <CropPageRange />,
  },
  {
    key: 'crop-type',
    title: 'viewer.cropPanel.cropType.title',
    component: <CropType />,
  },
  {
    key: 'crop-dimension',
    title: 'viewer.cropPanel.cropDimension.title',
    component: <CropDimension />,
  },
];

const CropPanel = () => {
  const { t } = useTranslation();
  const { contextValue } = useCropPanelStates();

  const { applyCrop } = useCropManipulation({
    cropDimension: contextValue.cropDimension,
    cropType: contextValue.cropType,
  });

  const handleApplyCrop = async () => {
    const totalPages = core.getTotalPages();
    const pageNumbers = getCropPageNumbers(contextValue.cropMode, contextValue.pageRangeValue, totalPages);

    if (pageNumbers.length > 0) {
      await applyCrop(pageNumbers);
    }
  };

  useCropPreviewInGridView({
    cropDimension: contextValue.cropDimension,
    cropMode: contextValue.cropMode,
    pageRangeValue: contextValue.pageRangeValue,
    isPageRangeValid: contextValue.isPageRangeValid,
  });

  useAutoDrawCropArea({
    cropDimension: contextValue.cropDimension,
    cropMode: contextValue.cropMode,
    pageRangeValue: contextValue.pageRangeValue,
  });

  useCleanupCropping();

  return (
    <CropPanelProvider value={contextValue}>
      <div className={styles.panelWrapper}>
        {PANEL_PROPERTIES.map(({ key, title, component }) => (
          <RightPanelProperty key={key}>
            <RightPanelProperty.Title>{t(title)}</RightPanelProperty.Title>
            <RightPanelProperty.Content>{component}</RightPanelProperty.Content>
          </RightPanelProperty>
        ))}
        <div>
          <Button
            disabled={!contextValue.isPageRangeValid}
            size={ButtonSize.lg}
            variant={ButtonVariant.filled}
            onClick={handleApplyCrop}
          >
            {t('common.apply')}
          </Button>
        </div>
      </div>
    </CropPanelProvider>
  );
};

export default CropPanel;
