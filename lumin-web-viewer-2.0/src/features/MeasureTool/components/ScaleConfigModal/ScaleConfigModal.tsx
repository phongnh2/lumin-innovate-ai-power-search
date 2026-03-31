import { Button, Modal, Select, Switch, Tabs } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { getCommonScaleFactors } from './constants';
import CustomSetting from './CustomSetting';
import { useScaleConfig } from './hooks/useScaleConfig';
import { useScaleModalActions } from './hooks/useScaleModalActions';
import PresetSetting from './PresetSetting';

import styles from './ScaleConfigModal.module.scss';

const ScaleConfigModal = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'custom' | 'preset'>('custom');

  const {
    isFractional,
    displayUnit,
    paperUnit,
    presetScale,
    precision,
    paperDistance,
    displayDistance,
    onDisplayUnitChange,
    onPaperUnitChange,
    handleFractionalChange,
    handlePrecisionChange,
    getDecimalValue,
    precisionData,
    isDisableFractionalUnit,
    setPresetScale,
    setDisplayDistance,
    setPaperDistance,
    openCalibrationTool,
  } = useScaleConfig();

  const { configModal, handleCloseScaleConfigModal, handleSave } = useScaleModalActions({
    activeTab,
    distances: { paperDistance, displayDistance },
    units: { paperUnit, displayUnit },
    precision,
    presetScale,
    isFractional,
  });

  return (
    <Modal
      data-cy="scale_config_modal"
      size="md"
      opened={configModal.isOpen}
      onClose={handleCloseScaleConfigModal}
      title={configModal.action === 'edit' ? t('viewer.measureTool.updateScale') : t('viewer.measureTool.setScale')}
    >
      <Tabs value={activeTab} variant="primary" onChange={(value: 'custom' | 'preset') => setActiveTab(value)}>
        <Tabs.List grow className={styles.tabList}>
          <Tabs.Tab value="custom">{t('viewer.measureTool.custom')}</Tabs.Tab>
          <Tabs.Tab value="preset">{t('viewer.measureTool.preset')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="custom">
          <CustomSetting
            isFractional={isFractional}
            displayUnit={displayUnit}
            onChangeDisplayUnit={onDisplayUnitChange}
            paperUnit={paperUnit}
            onChangePaperUnit={onPaperUnitChange}
            paperDistance={paperDistance}
            onPaperDistanceChange={setPaperDistance}
            displayDistance={displayDistance}
            onDisplayDistanceChange={setDisplayDistance}
            precision={Number(precision)}
            openCalibrationTool={openCalibrationTool}
          />
        </Tabs.Panel>
        <Tabs.Panel value="preset">
          <PresetSetting
            presetScale={presetScale}
            setPresetScale={setPresetScale}
            commonScaleFactors={getCommonScaleFactors(isFractional)}
          />
        </Tabs.Panel>
      </Tabs>
      <div className={styles.precisionSection}>
        <div className={styles.precisionInputGroupGrow}>
          <h2 className={styles.precisionTitle}>{t('viewer.measureTool.precision')}</h2>
          <Select
            data={precisionData}
            className={styles.precisionSelect}
            value={precision.toString()}
            onChange={handlePrecisionChange}
            renderOption={(item) => item.option.label}
          />
        </div>
        <div className={styles.precisionInputGroup}>
          <h2 className={styles.precisionTitle}>{t('viewer.measureTool.fractionalUnits')}</h2>
          <Switch
            checked={isFractional}
            disabled={isDisableFractionalUnit}
            size="md"
            onChange={handleFractionalChange}
          />
        </div>
      </div>

      <div className={styles.modalFooter}>
        <Button size="lg" variant="text" className={styles.footerButton} onClick={handleCloseScaleConfigModal}>
          {t('common.cancel')}
        </Button>
        <Button
          size="lg"
          className={styles.footerButton}
          disabled={!getDecimalValue(displayDistance, displayUnit) || !getDecimalValue(paperDistance, paperUnit)}
          onClick={handleSave}
        >
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  );
};

export default ScaleConfigModal;
