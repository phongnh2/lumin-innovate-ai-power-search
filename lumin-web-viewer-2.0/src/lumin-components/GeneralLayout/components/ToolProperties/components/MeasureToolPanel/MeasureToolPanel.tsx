import { Divider } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useMemo } from 'react';

import StrokeWidthSlider from '@new-ui/components/StrokeWidthSlider';
import OpacitySlider from '@new-ui/general-components/OpacitySlider';

import ColorPalette from 'lumin-components/GeneralLayout/general-components/ColorPalette';

import { useTranslation } from 'hooks/useTranslation';

import getAnnotationStyles from 'helpers/getAnnotationStyles';

import MeasurePanelHeader from 'features/MeasureTool/components/MeasurePanelHeader';

import { useMeasureToolPanel } from './hook/useMeasureToolPanel';

import styles from './MeasureToolPanel.module.scss';

const MeasureToolPanel = () => {
  const {
    color,
    opacity,
    fillColor,
    strokeWidth,
    isSelectedMultiple,
    headerProperties,
    hasStroke,
    hasFill,
    selectedMeasureAnnot,
    hasOpacity,
    isSelectedTool,
    setColor,
    setFillColor,
    setOpacity,
    setStrokeWidth,
    handleStrokeColorChange,
    handleFillColorChange,
    handleOpacityChange,
    handleStrokeWidthChange,
  } = useMeasureToolPanel();
  const { t } = useTranslation();
  const style = useMemo(() => {
    if (selectedMeasureAnnot.length) {
      return { ...getAnnotationStyles(selectedMeasureAnnot[0]) };
    }
    return null;
  }, [selectedMeasureAnnot]);

  useEffect(() => {
    if (style) {
      setColor(style.StrokeColor);
      setFillColor(style.FillColor);
      setOpacity(style.Opacity);
      setStrokeWidth(style.StrokeThickness);
    }
  }, [style]);

  const renderStroke = () => {
    if (hasStroke || isSelectedMultiple) {
      return (
        <div>
          <h3 className={styles.title}>{t('viewer.measureToolPanel.strokeColor')}</h3>
          <ColorPalette value={color} onChange={handleStrokeColorChange} />

          <div className={styles.strokeWidthSlider}>
            <StrokeWidthSlider onChange={handleStrokeWidthChange} style={{ ...style, StrokeThickness: strokeWidth }} />
          </div>
        </div>
      );
    }
    return null;
  };

  const renderFill = () => {
    if (hasFill || isSelectedMultiple) {
      return (
        <>
          <Divider />
          <div>
            <h3 className={styles.title}>{t('viewer.measureToolPanel.fillColor')}</h3>
            <ColorPalette includeNoFill value={fillColor} onChange={handleFillColorChange} />
          </div>
        </>
      );
    }
    return null;
  };

  const renderOpacity = () => {
    if (hasOpacity || isSelectedMultiple) {
      return (
        <>
          <Divider />
          <div>
            <h3 className={styles.title}>{t('viewer.measureToolPanel.opacity')}</h3>
            <OpacitySlider style={{ Opacity: opacity }} onChange={handleOpacityChange} />
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.body}>
        {selectedMeasureAnnot.length > 0 || isSelectedTool ? (
          <>
            <MeasurePanelHeader properties={headerProperties} selectedAnnotations={selectedMeasureAnnot} />
            {renderStroke()}
            {renderFill()}
            {renderOpacity()}
          </>
        ) : (
          <span className={styles.emptyText}>{t('viewer.measureToolPanel.selectPropertiesToEdit')}</span>
        )}
      </div>
    </div>
  );
};

export default MeasureToolPanel;
