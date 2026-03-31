import { useDispatch, useSelector } from 'react-redux';

import core from 'core';

import { useScaleFormatting } from 'features/MeasureTool/hooks';
import { ScaleUnits, ScaleDistances, ScaleInfo } from 'features/MeasureTool/interfaces';
import { measureToolActions, measureToolSelectors } from 'features/MeasureTool/slices';

export const useScaleModalActions = ({
  activeTab,
  distances,
  units,
  precision,
  presetScale,
  isFractional,
}: {
  activeTab: 'custom' | 'preset';
  distances: ScaleDistances;
  units: ScaleUnits;
  precision: number;
  presetScale: string;
  isFractional: boolean;
}) => {
  const dispatch = useDispatch();
  const scales = useSelector(measureToolSelectors.getScales);
  const selectedScale = useSelector(measureToolSelectors.getSelectedScale);
  const configModal = useSelector(measureToolSelectors.getConfigModal);
  const { getFormattedCurrentValue } = useScaleFormatting(isFractional);

  const handleCloseScaleConfigModal = () => {
    dispatch(measureToolActions.setConfigModal({ isOpen: false }));
  };

  const createNewScale = (scale: Core.Scale) => {
    const scaleExisted = scales.find((item: ScaleInfo) => item.title === scale.toString());
    if (scaleExisted) {
      dispatch(measureToolActions.setSelectedScale(scaleExisted));
      return;
    }

    const selectedTools = core.getToolMode();
    const selectedAnnots = core.getSelectedAnnotations();
    const applyTo = [...selectedAnnots, selectedTools];
    core.getMeasurementManager().createAndApplyScale({
      scale,
      applyTo,
    });
    const scaleInfo = {
      title: scale.toString(),
      scale,
      precision: scale.precision,
    };
    dispatch(measureToolActions.addScale(scaleInfo));
    dispatch(measureToolActions.setSelectedScale(scaleInfo));
  };

  const replaceScale = (newScale: Core.Scale) => {
    const annots = core.getAnnotationsList();
    const originalScale = configModal.scaleInfo;
    const hasAnnotationWithScale = annots.find((annot) => annot?.Measure?.scale?.toString() === originalScale.title);
    if (hasAnnotationWithScale) {
      core.getMeasurementManager().replaceScale(originalScale.scale, newScale);
    }
    const replaceScaleInfo = {
      ...originalScale,
      title: newScale.toString(),
      scale: newScale,
      precision: newScale.precision,
    };
    if (originalScale.title === selectedScale.title) {
      dispatch(measureToolActions.setSelectedScale(replaceScaleInfo));
    }
    dispatch(
      measureToolActions.replaceScale({
        originalScale,
        replaceScale: replaceScaleInfo,
      })
    );
  };

  const handleSave = () => {
    const paperDistance = getFormattedCurrentValue(distances.paperDistance, units.paperUnit);
    const displayDistance = getFormattedCurrentValue(distances.displayDistance, units.displayUnit);
    const scaleRatio =
      activeTab === 'custom'
        ? {
            pageScale: { value: paperDistance, unit: units.paperUnit },
            worldScale: { value: displayDistance, unit: units.displayUnit },
          }
        : presetScale.toString();
    const newScale = new Core.Scale(scaleRatio, precision);
    if (configModal.action === 'create') {
      createNewScale(newScale);
    } else {
      replaceScale(newScale);
    }
    handleCloseScaleConfigModal();
    configModal.callback?.(newScale);
  };

  return {
    configModal,
    handleCloseScaleConfigModal,
    handleSave,
  };
};
