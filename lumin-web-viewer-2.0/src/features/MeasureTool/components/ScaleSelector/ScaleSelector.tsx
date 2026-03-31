import { Button, Divider, Icomoon, IconButton, Menu, MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import core from 'core';

import { useTranslation } from 'hooks/useTranslation';

import { useDeleteScale } from 'features/MeasureTool/hooks';
import { ScaleInfo } from 'features/MeasureTool/interfaces';
import { getScaleRatio } from 'features/MeasureTool/utils/getScaleRatio';

import { measureToolActions, measureToolSelectors } from '../../slices';

import styles from './ScaleSelector.module.scss';

const ScaleSelector = ({
  isSelectMultiple,
  setIsSelectMultiple,
}: {
  isSelectMultiple: boolean;
  setIsSelectMultiple: (isSelectMultiple: boolean) => void;
}) => {
  const [opened, setOpened] = useState(false);
  const scales = useSelector(measureToolSelectors.getScales);
  const { deleteScale } = useDeleteScale();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedScale = useSelector(measureToolSelectors.getSelectedScale);

  const toggleMenu = () => {
    setOpened((prev) => !prev);
  };

  const handleAddScale = () => {
    dispatch(measureToolActions.setConfigModal({ isOpen: true, action: 'create' }));
    setOpened(false);
  };

  const handleEditScale = (scale: ScaleInfo, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    dispatch(measureToolActions.setConfigModal({ isOpen: true, action: 'edit', scaleInfo: scale }));
    setOpened(false);
  };

  const handleSelectScale = (scale: ScaleInfo) => {
    dispatch(measureToolActions.setSelectedScale(scale));
    const selectedAnnotations = core.getAnnotationManager().getSelectedAnnotations();
    const selectedTools = core.getToolMode();
    const applyTo = [...selectedAnnotations, selectedTools];
    core.getMeasurementManager().createAndApplyScale({
      scale: scale.scale,
      applyTo,
    });
    setIsSelectMultiple(false);
  };

  if (scales.length === 0) {
    return null;
  }

  return (
    <div>
      <Menu
        opened={opened}
        ComponentTarget={
          <Button
            classNames={{
              root: styles.targetButton,
              inner: styles.targetButtonInner,
            }}
            variant="outlined"
            onClick={toggleMenu}
            rightSection={<Icomoon type="chevron-down-sm" size="sm" />}
          >
            {isSelectMultiple ? t('viewer.measureTool.selectMultipleScales') : getScaleRatio(selectedScale)}
          </Button>
        }
        position="bottom-end"
        closeOnClickOutside
        closeOnEscape
        closeOnItemClick
        onClose={() => setOpened(false)}
      >
        <div className={styles.menuContent}>
          <div className={styles.menuItems}>
            {scales.map((item) => (
              <MenuItem
                key={item.title}
                activated={selectedScale?.title === item.title && !isSelectMultiple}
                onClick={() => handleSelectScale(item)}
                classNames={{
                  item: styles.rootMenuItem,
                }}
              >
                <div className={styles.menuItem}>
                  {getScaleRatio(item)}
                  <div className={styles.menuItemActions}>
                    <PlainTooltip content={t('viewer.measureTool.editScale')}>
                      <IconButton size="sm" icon="ph-note-pencil" onClick={(event) => handleEditScale(item, event)} />
                    </PlainTooltip>
                    <PlainTooltip content={t('viewer.measureTool.deleteScale')}>
                      <IconButton
                        classNames={{
                          root: styles.trashButton,
                        }}
                        size="sm"
                        icon="ph-trash"
                        {...(scales.length > 1 && { onClick: (event) => deleteScale(item, event) })}
                        disabled={scales.length === 1}
                      />
                    </PlainTooltip>
                  </div>
                </div>
              </MenuItem>
            ))}
          </div>
          <Divider orientation="horizontal" className={styles.divider} />
          <div className={styles.addNewScale}>
            <Button className={styles.button} onClick={handleAddScale} variant="outlined">
              {t('viewer.measureTool.addNewScale')}
            </Button>
          </div>
        </div>
      </Menu>
    </div>
  );
};

export default ScaleSelector;
