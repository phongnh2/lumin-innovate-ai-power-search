import { Checkbox, Icomoon, Button, IconButton } from 'lumin-ui/kiwi-ui';
import React, { ChangeEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { switchTool } from '@new-ui/components/LuminToolbar/utils';
import SecondaryToolbar from '@new-ui/components/SecondaryToolbar';
import { ToolName } from 'core/type';

import core from 'core';
import selectors from 'selectors';

import SingleButton from 'luminComponents/ViewerCommonV2/ToolButton/SingleButton';

import useShallowSelector from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { MeasureTools } from 'features/MeasureTool/constants';
import { useGetScales, useUpdateSelectedScale } from 'features/MeasureTool/hooks';
import { useMouseLeftUpHandler } from 'features/MeasureTool/hooks/useMouseLeftUpHandler';
import { MeasureToolProps } from 'features/MeasureTool/interfaces';
import { measureToolActions, measureToolSelectors } from 'features/MeasureTool/slices';
import { getMeasureTools } from 'features/MeasureTool/utils/getMeasureTools';

import defaultTool from 'constants/defaultTool';
import { TOOLS_NAME } from 'constants/toolsName';

import ScaleConfigModal from '../ScaleConfigModal';
import ScaleSelector from '../ScaleSelector';

import styles from './MeasureToolbar.module.scss';

const MeasureToolbar = () => {
  const { t } = useTranslation();
  const activeToolName = useShallowSelector(selectors.getActiveToolName);
  const [isSelectMultiple, setIsSelectMultiple] = useState(false);
  const selectedScale = useSelector(measureToolSelectors.getSelectedScale);
  const scales = useSelector(measureToolSelectors.getScales);
  const dispatch = useDispatch();

  useMouseLeftUpHandler();
  useGetScales();
  useUpdateSelectedScale({ setIsSelectMultiple });

  const handleOpenScaleConfigModal = (params?: { callback: (newScale: Core.Scale) => void }) => {
    dispatch(
      measureToolActions.setConfigModal({
        isOpen: true,
        action: 'create',
        callback: params?.callback,
      })
    );
  };

  const handleExitCalibrate = () => {
    core.setToolMode(defaultTool as ToolName);
  };

  const handleSnappingChange = (event: ChangeEvent<HTMLInputElement>) => {
    const enabledSnapping = event.target.checked;
    const tools = getMeasureTools();
    const snapMode = enabledSnapping ? Core.PDFNet.GeometryCollection.SnappingMode.e_DefaultSnapMode : null;
    tools.forEach((tool) => {
      tool.setSnapMode?.(snapMode);
    });
  };

  const handleSwitchTool = ({
    toolName,
    isActive,
    scale,
  }: {
    toolName: ToolName;
    isActive: boolean;
    scale?: Core.Scale;
  }) => {
    core.deselectAllAnnotations();
    const toolMode = core.getTool(toolName);
    core.getMeasurementManager().createAndApplyScale({
      scale,
      applyTo: [toolMode],
    });
    switchTool({ toolName: toolName as string, isActive });
  };

  const renderMeasureItem = (tool: MeasureToolProps) => {
    const isToolActive = activeToolName === tool.toolName;
    return (
      <SingleButton
        key={tool.icon}
        icon={tool.icon}
        isUsingKiwiIcon
        isActive={isToolActive}
        tooltipProps={{
          position: 'bottom',
          content: t(`viewer.measureAnnotation.${tool.label}`),
        }}
        onClick={() => {
          if (selectedScale?.scale) {
            handleSwitchTool({
              toolName: tool.toolName as ToolName,
              isActive: isToolActive,
              scale: selectedScale.scale,
            });
          } else {
            handleOpenScaleConfigModal({
              callback: (newScale: Core.Scale) => {
                handleSwitchTool({ toolName: tool.toolName as ToolName, isActive: isToolActive, scale: newScale });
              },
            });
          }
        }}
      />
    );
  };

  if (activeToolName === TOOLS_NAME.CALIBRATION_MEASUREMENT) {
    return (
      <SecondaryToolbar.Container data-cy="calibration_measurement_toolbar">
        <SecondaryToolbar.LeftSection>
          <IconButton icon="ph-note-pencil" size="md" />
          <SecondaryToolbar.ToolTitle>{t('viewer.measureTool.calibrate')}</SecondaryToolbar.ToolTitle>
          <SecondaryToolbar.Divider />
          <SecondaryToolbar.ToolDescription>
            {t('viewer.measureTool.calibrateDescription')}
          </SecondaryToolbar.ToolDescription>
        </SecondaryToolbar.LeftSection>
        <SecondaryToolbar.RightSection>
          <Button variant="outlined" colorType="error" onClick={handleExitCalibrate}>
            {t('viewer.measureTool.exitCalibrate')}
          </Button>
        </SecondaryToolbar.RightSection>
      </SecondaryToolbar.Container>
    );
  }

  return (
    <SecondaryToolbar.Container data-cy="measurement_toolbar">
      <SecondaryToolbar.LeftSection>{MeasureTools.map((tool) => renderMeasureItem(tool))}</SecondaryToolbar.LeftSection>
      <SecondaryToolbar.RightSection>
        <Checkbox
          onChange={handleSnappingChange}
          label={<div className={styles.toolInfo}>{t('viewer.measureTool.snapping')}</div>}
        />
        <SecondaryToolbar.Divider />
        <Icomoon type="ph-resize" size="md" color="var(--kiwi-colors-surface-on-surface)" />
        <div className={styles.toolInfo}>{t('viewer.measureTool.scale')}</div>
        {scales.length === 0 ? (
          <Button
            data-cy="add_new_scale"
            variant="tonal"
            colorType="system"
            size="md"
            onClick={() => handleOpenScaleConfigModal()}
          >
            {t('viewer.measureTool.addNewScale')}
          </Button>
        ) : (
          <ScaleSelector isSelectMultiple={isSelectMultiple} setIsSelectMultiple={setIsSelectMultiple} />
        )}
      </SecondaryToolbar.RightSection>
      <ScaleConfigModal />
    </SecondaryToolbar.Container>
  );
};

export default MeasureToolbar;
