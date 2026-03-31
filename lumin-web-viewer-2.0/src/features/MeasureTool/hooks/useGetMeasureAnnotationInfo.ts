import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import { useTranslation } from 'hooks/useTranslation';

import { TOOLS_NAME } from 'constants/toolsName';

import { measureToolSelectors } from '../slices';
import { getAngleInRadians } from '../utils/getAngleInRadians';
import { getNumberOfDecimalPlaces } from '../utils/getNumberOfDecimalPlaces';

interface IMeasureProperties {
  headerProperties: {
    title: string;
    precision: number;
    distance: boolean;
  };
  bodyProperties: {
    stroke: boolean;
    opacity: boolean;
    fill: boolean;
  };
}

export const useGetMeasureAnnotationInfo = (measureAnnotation: Core.Annotations.Annotation) => {
  const { t } = useTranslation();
  const activeToolName = useSelector(selectors.getActiveToolName);
  const selectedScale = useSelector(measureToolSelectors.getSelectedScale);
  const [measureProperties, setMeasureProperties] = useState<IMeasureProperties>({
    headerProperties: {
      title: '',
      precision: 0.0001,
      distance: false,
    },
    bodyProperties: {
      stroke: true,
      opacity: true,
      fill: false,
    },
  });

  const getAnnotationAngle = (annotation: Core.Annotations.PolylineAnnotation | Core.Annotations.PolygonAnnotation) => {
    const { length } = annotation.getPath();
    const iPathPts = [
      annotation.getPath()[length - 3],
      annotation.getPath()[length - 2],
      annotation.getPath()[length - 1],
    ].filter(Boolean);
    const angle = getAngleInRadians(iPathPts[0], iPathPts[1], iPathPts[2]);
    if (!angle) {
      return '';
    }
    const decimalPlaces = getNumberOfDecimalPlaces(annotation.Precision);
    return ((angle / Math.PI) * 180).toFixed(decimalPlaces);
  };

  const precision = measureAnnotation
    ? core.getMeasurementManager().getScalePrecision(measureAnnotation?.Measure?.scale)
    : selectedScale?.precision;
  const areaLabel = t('viewer.measureToolPanel.area');

  const getMeasureProperties = useCallback(() => {
    switch (true) {
      case (measureAnnotation && measureAnnotation.IT === 'LineDimension') ||
        (!measureAnnotation && activeToolName === TOOLS_NAME.DISTANCE_MEASUREMENT): {
        return {
          headerProperties: {
            title: t('viewer.measureToolPanel.distanceMeasurement'),
            precision,
            distance: true,
          },
          bodyProperties: {
            stroke: true,
            opacity: true,
            fill: false,
          },
        };
      }
      case (measureAnnotation &&
        measureAnnotation.IT === 'ArcDimension' &&
        measureAnnotation instanceof Core.Annotations.ArcAnnotation) ||
        (!measureAnnotation && activeToolName === TOOLS_NAME.ARC_MEASUREMENT): {
        return {
          headerProperties: {
            title: t('viewer.measureToolPanel.arcMeasurement'),
            precision,
            distance: false,
            content: {
              label: t('viewer.measureToolPanel.length'),
              value: measureAnnotation instanceof Core.Annotations.ArcAnnotation && measureAnnotation.Length.toString(),
            },
            radius: measureAnnotation instanceof Core.Annotations.ArcAnnotation && measureAnnotation.Radius.toString(),
            angle:
              measureAnnotation instanceof Core.Annotations.ArcAnnotation &&
              Number(measureAnnotation.Angle).toFixed(2).toString(),
          },
          bodyProperties: {
            stroke: true,
            opacity: true,
            fill: false,
          },
        };
      }
      case (measureAnnotation &&
        measureAnnotation.IT === 'PolyLineDimension' &&
        measureAnnotation instanceof Core.Annotations.PolylineAnnotation) ||
        (!measureAnnotation && activeToolName === TOOLS_NAME.PERIMETER_MEASUREMENT): {
        return {
          headerProperties: {
            title: t('viewer.measureToolPanel.perimeterMeasurement'),
            precision,
            distance: false,
            content: {
              label: t('viewer.measureToolPanel.perimeter'),
              value:
                measureAnnotation instanceof Core.Annotations.PolylineAnnotation &&
                measureAnnotation.getMeasurementTextWithScaleAndUnits?.(),
            },
            angle:
              measureAnnotation instanceof Core.Annotations.PolylineAnnotation && getAnnotationAngle(measureAnnotation),
          },
          bodyProperties: {
            stroke: true,
            opacity: true,
            fill: false,
          },
        };
      }
      case (measureAnnotation &&
        measureAnnotation.IT === 'EllipseDimension' &&
        measureAnnotation instanceof Core.Annotations.EllipseAnnotation) ||
        (!measureAnnotation && activeToolName === TOOLS_NAME.ELLIPSE_MEASUREMENT): {
        return {
          headerProperties: {
            title: t('viewer.measureToolPanel.ellipseMeasurement'),
            precision,
            distance: false,
            ellipse: true,
          },
          bodyProperties: {
            stroke: true,
            opacity: true,
            fill: true,
          },
        };
      }
      case (measureAnnotation &&
        measureAnnotation.IT === 'PolygonDimension' &&
        measureAnnotation instanceof Core.Annotations.PolygonAnnotation &&
        measureAnnotation.isRectangularPolygon()) ||
        (!measureAnnotation && activeToolName === TOOLS_NAME.RECTANGULAR_AREA_MEASUREMENT): {
        return {
          headerProperties: {
            title: t('viewer.measureToolPanel.rectangularAreaMeasurement'),
            precision,
            distance: false,
            content: {
              label: areaLabel,
              value:
                measureAnnotation instanceof Core.Annotations.PolygonAnnotation &&
                measureAnnotation.getMeasurementTextWithScaleAndUnits?.(),
            },
          },
          bodyProperties: {
            stroke: true,
            opacity: true,
            fill: true,
          },
        };
      }
      case (measureAnnotation &&
        measureAnnotation.IT === 'PolygonDimension' &&
        measureAnnotation instanceof Core.Annotations.PolygonAnnotation) ||
        (!measureAnnotation && activeToolName === TOOLS_NAME.AREA_MEASUREMENT): {
        return {
          headerProperties: {
            title: t('viewer.measureToolPanel.areaMeasurement'),
            precision,
            distance: false,
            content: {
              label: areaLabel,
              value:
                measureAnnotation instanceof Core.Annotations.PolygonAnnotation &&
                measureAnnotation.getMeasurementTextWithScaleAndUnits?.(),
            },
            angle:
              measureAnnotation instanceof Core.Annotations.PolygonAnnotation && getAnnotationAngle(measureAnnotation),
          },
          bodyProperties: {
            stroke: true,
            opacity: true,
            fill: true,
          },
        };
      }
      default: {
        return {
          headerProperties: {
            title: '',
            precision: 0.0001,
            distance: false,
          },
          bodyProperties: {
            stroke: true,
            opacity: true,
            fill: false,
          },
        };
      }
    }
  }, [measureAnnotation, activeToolName, t, precision, areaLabel]);

  useEffect(() => {
    const properties = getMeasureProperties();
    setMeasureProperties(properties);

    const onUpdateMeasureProperties = () => {
      setMeasureProperties(getMeasureProperties());
    };

    core.addEventListener('annotationSelected', onUpdateMeasureProperties);
    core.addEventListener('annotationChanged', onUpdateMeasureProperties);

    return () => {
      core.removeEventListener('annotationSelected', onUpdateMeasureProperties);
      core.removeEventListener('annotationChanged', onUpdateMeasureProperties);
    };
  }, [measureAnnotation, getMeasureProperties]);

  return measureProperties;
};
