import i18next from 'i18next';

import getGroupedLinkAnnotations from 'helpers/getGroupedLinkAnnotations';

import { CUSTOM_ANNOTATION, AnnotationSubjectMapping } from 'constants/documentConstants';
/**
 * this is the map we used to get information about annotations and tools
 * for example, we can look for map.freeHand.currentPalette to get the current color palette for freeHandAnnotation and freeHandTool
 * ideally, this map file should be the only place which provides information about annotations and tools
 * if you are tempted to create a new map file(which maps a tool/annotation to something else) under this constants folder
 * please make sure that it is not possible to implement that map here
 */

const textHighlightMapping = {
  iconColor: 'StrokeColor',
  currentPalette: 'StrokeColor',
  availablePalettes: ['StrokeColor'],
  toolNames: [
    'AnnotationCreateTextHighlight',
    'AnnotationCreateTextHighlight2',
    'AnnotationCreateTextHighlight3',
    'AnnotationCreateTextHighlight4',
  ],
};

const map = {
  signature: {
    icon: 'tool-signature',
    iconColor: null,
    currentPalette: 'StrokeColor',
    availablePalettes: [],
    // iconColor: 'StrokeColor',
    // currentPalette: 'StrokeColor',
    // availablePalettes: ['StrokeColor'],
    toolNames: ['AnnotationCreateSignature'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.StampAnnotation &&
      annotation.Subject === i18next.t('annotation.signature'),
  },
  freeHand: {
    icon: 'tool-freehand',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: [
      'AnnotationCreateFreeHand',
      'AnnotationCreateFreeHand2',
      'AnnotationCreateFreeHand3',
      'AnnotationCreateFreeHand4',
    ],
    annotationCheck: (annotation) =>
      annotation instanceof window.Core.Annotations.FreeHandAnnotation &&
      annotation.Subject === AnnotationSubjectMapping.freehand,
  },
  freeText: {
    icon: 'tool-freetext',
    iconColor: 'TextColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['TextColor', 'StrokeColor', 'FillColor'],
    toolNames: ['AnnotationCreateFreeText'],
    annotationCheck: (annotation) =>
      annotation instanceof window.Core.Annotations.FreeTextAnnotation &&
      annotation.getIntent() === window.Core.Annotations.FreeTextAnnotation.Intent.FreeText &&
      !annotation.getDateFormat(),
  },
  distanceMeasurement: {
    icon: 'ph-arrows-horizontal',
    isKiwiIcon: true,
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: ['AnnotationCreateDistanceMeasurement'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.LineAnnotation &&
      annotation.IT === 'LineDimension' &&
      annotation.Measure,
  },
  perimeterMeasurement: {
    icon: 'lm-perimeter',
    isKiwiIcon: true,
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: ['AnnotationCreatePerimeterMeasurement'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.PolylineAnnotation &&
      annotation.IT === 'PolyLineDimension' &&
      annotation.Measure,
  },
  rectangularAreaMeasurement: {
    icon: 'lm-rectangle-area',
    isKiwiIcon: true,
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor', 'FillColor'],
    toolNames: [window.Core.Tools.ToolNames.RECTANGULAR_AREA_MEASUREMENT],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.PolygonAnnotation &&
      annotation.IT === 'PolygonDimension' &&
      annotation.Measure &&
      annotation.isRectangularPolygon(),
  },
  areaMeasurement: {
    icon: 'lm-polygon-area',
    isKiwiIcon: true,
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor', 'FillColor'],
    toolNames: ['AnnotationCreateAreaMeasurement'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.PolygonAnnotation &&
      annotation.IT === 'PolygonDimension' &&
      annotation.Measure,
  },
  ellipseMeasurement: {
    icon: 'lm-circle-area',
    isKiwiIcon: true,
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor', 'FillColor'],
    toolNames: ['AnnotationCreateEllipseMeasurement'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.EllipseAnnotation &&
      annotation.IT === 'EllipseDimension' &&
      annotation.Measure,
  },
  arcMeasurement: {
    icon: 'ph-angle',
    isKiwiIcon: true,
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: [
      'AnnotationCreateArcMeasurement',
      'AnnotationCreateArcMeasurement2',
      'AnnotationCreateArcMeasurement3',
      'AnnotationCreateArcMeasurement4',
    ],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.ArcAnnotation &&
      annotation.IT === 'ArcDimension' &&
      annotation.Measure,
  },
  callout: {
    icon: '',
    iconColor: 'TextColor',
    currentPalette: 'TextColor',
    availablePalettes: ['TextColor', 'StrokeColor', 'FillColor'],
    toolNames: ['AnnotationCreateCallout'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.FreeTextAnnotation &&
      annotation.getIntent() ===
        window.Core.Annotations.FreeTextAnnotation.Intent.FreeTextCallout,
  },
  line: {
    icon: 'tool-line',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: ['AnnotationCreateLine'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.LineAnnotation &&
      annotation.getStartStyle() === 'None' &&
      annotation.getEndStyle() === 'None',
  },
  arrow: {
    icon: 'tool-arrow',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: ['AnnotationCreateArrow'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.LineAnnotation &&
      (annotation.getStartStyle() !== 'None' ||
        annotation.getEndStyle() !== 'None'),
  },
  polygon: {
    icon: 'tool-polygon',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor', 'FillColor'],
    toolNames: ['AnnotationCreatePolygon'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.PolygonAnnotation &&
      annotation.Style !== 'cloudy',
  },
  cloud: {
    icon: 'tool-cloud',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor', 'FillColor'],
    toolNames: ['AnnotationCreatePolygonCloud'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.PolygonAnnotation &&
      annotation.Style === 'cloudy',
  },
  highlight: {
    icon: 'tool-highlight',
    ...textHighlightMapping,
    annotationCheck: (annotation) => {
      const linkAnnotations = getGroupedLinkAnnotations(annotation);
      return annotation instanceof window.Core.Annotations.TextHighlightAnnotation && linkAnnotations.length === 0;
    },
  },
  hyperlink: {
    icon: 'link',
    ...textHighlightMapping,
    annotationCheck: (annotation) => {
      const linkAnnotations = getGroupedLinkAnnotations(annotation);
      return annotation instanceof window.Core.Annotations.TextHighlightAnnotation && linkAnnotations.length !== 0;
    },
  },
  underline: {
    icon: 'tool-underline',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: ['AnnotationCreateTextUnderline'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.TextUnderlineAnnotation,
  },
  squiggly: {
    icon: 'tool-squiggly',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: ['AnnotationCreateTextSquiggly'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.TextSquigglyAnnotation,
  },
  strikeout: {
    icon: 'tool-strike',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: ['AnnotationCreateTextStrikeout'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.TextStrikeoutAnnotation,
  },
  redaction: {
    icon: 'annotation-redact',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor', 'FillColor'],
    toolNames: ['AnnotationCreateRedaction'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.RedactionAnnotation,
  },
  rectangle: {
    icon: 'tool-rectangle',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor', 'FillColor'],
    toolNames: ['AnnotationCreateRectangle'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.RectangleAnnotation,
  },
  ellipse: {
    icon: 'tool-ellipse',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor', 'FillColor'],
    toolNames: ['AnnotationCreateEllipse'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.EllipseAnnotation,
  },
  polyline: {
    icon: 'tool-polyline',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: ['AnnotationCreatePolyline'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.PolylineAnnotation,
  },
  stickyNote: {
    icon: 'comment-alt',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: ['AnnotationCreateSticky'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.StickyAnnotation,
  },
  stamp: {
    icon: 'tool-stamp',
    iconColor: null,
    currentPalette: null,
    availablePalettes: [],
    toolNames: ['AnnotationCreateStamp', 'AnnotationCreateRubberStamp'],
    annotationCheck: (annotation) =>
      annotation instanceof window.Core.Annotations.StampAnnotation &&
      annotation.Subject === AnnotationSubjectMapping.stamp,
  },
  rubberStamp: {
    icon: 'tool-rubber-stamp',
    iconColor: null,
    currentPalette: null,
    availablePalettes: [],
    toolNames: ['AnnotationCreateRubberStamp'],
    annotationCheck: (annotation) =>
      annotation instanceof window.Core.Annotations.StampAnnotation &&
      annotation.Subject === AnnotationSubjectMapping.draft,
  },
  edit: {
    icon: 'select',
    iconColor: null,
    currentPalette: null,
    availablePalettes: [],
    toolNames: ['AnnotationEdit'],
    annotationCheck: null,
  },
  pan: {
    icon: 'hand',
    iconColor: null,
    currentPalette: null,
    availablePalettes: [],
    toolNames: ['Pan'],
    annotationCheck: null,
  },
  textSelect: {
    icon: 'cursor',
    iconColor: null,
    currentPalette: null,
    availablePalettes: [],
    toolNames: ['TextSelect'],
    annotationCheck: null,
  },

  marqueeZoomTool: {
    icon: null,
    iconColor: null,
    currentPalette: null,
    availablePalettes: [],
    toolNames: ['MarqueeZoomTool'],
    annotationCheck: null,
  },
  eraser: {
    icon: 'annotation-eraser',
    iconColor: null,
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: ['AnnotationEraserTool'],
    annotationCheck: (annotation) =>
      annotation instanceof window.Core.Annotations.FreeHandAnnotation &&
      ![AnnotationSubjectMapping.freehand, AnnotationSubjectMapping.freehandHighlight].includes(annotation.Subject),
  },
  cropPage: {
    icon: 'ic_crop_black_24px',
    iconColor: null,
    currentPalette: null,
    availablePalettes: [],
    toolNames: ['CropPage'],
    annotationCheck: null,
  },
  fileattachment: {
    icon: 'ic_placeholder_black_24px',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: ['AnnotationCreateFileAttachment'],
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.FileAttachmentAnnotation,
  },
  star: {
    icon: 'star-empty',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor', 'FillColor'],
    toolNames: [CUSTOM_ANNOTATION.STAR.tool],
    annotationCheck: (annotation) =>
      annotation instanceof window.Core.Annotations.CustomAnnotation &&
      annotation.Subject === CUSTOM_ANNOTATION.STAR.subject,
  },
  cross: {
    icon: 'cancel',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: [CUSTOM_ANNOTATION.CROSS.tool],
    annotationCheck: (annotation) =>
      annotation instanceof window.Core.Annotations.CustomAnnotation &&
      annotation.Subject === CUSTOM_ANNOTATION.CROSS.subject,
  },
  tick: {
    icon: 'check',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['StrokeColor'],
    toolNames: [CUSTOM_ANNOTATION.TICK.tool],
    annotationCheck: (annotation) =>
      annotation instanceof window.Core.Annotations.CustomAnnotation &&
      annotation.Subject === CUSTOM_ANNOTATION.TICK.subject,
  },
  dateFreeText: {
    icon: 'calendar',
    iconColor: 'TextColor',
    currentPalette: 'StrokeColor',
    availablePalettes: ['TextColor', 'StrokeColor', 'FillColor'],
    toolNames: [
      'AnnotationCreateDateFreeText',
    ],
    // eslint-disable-next-line sonarjs/no-identical-functions
    annotationCheck: (annotation) =>
      annotation instanceof window.Core.Annotations.FreeTextAnnotation &&
      annotation.getIntent() === window.Core.Annotations.FreeTextAnnotation.Intent.FreeText &&
      Boolean(annotation.getDateFormat()),
  },
  freehandHighlight: {
    icon: 'tool-freehand-highlight',
    iconColor: 'StrokeColor',
    currentPalette: 'StrokeColor',
    availablePalettes: [ 'StrokeColor'],
    toolNames: [
      'AnnotationCreateFreeHandHighlight',
    ],
    // eslint-disable-next-line sonarjs/no-identical-functions
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.FreeHandAnnotation &&
      annotation.Subject === AnnotationSubjectMapping.freehandHighlight,
  },
  dotStamp: {
    icon: 'tool_dot_stamp',
    iconColor: null,
    currentPalette: null,
    availablePalettes: [],
    toolNames: [
      'AnnotationCreateDotStamp',
    ],
    // eslint-disable-next-line sonarjs/no-identical-functions
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.StampAnnotation &&
      annotation.Subject === AnnotationSubjectMapping.dotStamp,
  },
  tickStamp: {
    icon: 'tool_check_stamp',
    iconColor: null,
    currentPalette: null,
    availablePalettes: [],
    toolNames: [
      'AnnotationCreateTickStamp',
    ],
    // eslint-disable-next-line sonarjs/no-identical-functions
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.StampAnnotation &&
      annotation.Subject === AnnotationSubjectMapping.tickStamp,
  },
  crossStamp: {
    icon: 'tool_cross_stamp',
    iconColor: null,
    currentPalette: null,
    availablePalettes: [],
    toolNames: [
      'AnnotationCreateCrossStamp',
    ],
    // eslint-disable-next-line sonarjs/no-identical-functions
    annotationCheck: (annotation) => annotation instanceof window.Core.Annotations.StampAnnotation &&
      annotation.Subject === AnnotationSubjectMapping.crossStamp,
  },
};

export const mapToolNameToKey = (toolName) => Object.keys(map).find((key) => map[key].toolNames.includes(toolName));

export const mapAnnotationToKey = (annotation) => Object.keys(map).find((key) => {
  const { annotationCheck } = map[key];
  return annotationCheck && annotationCheck(annotation);
});

export const mapAnnotationToToolName = (annotation) => map[mapAnnotationToKey(annotation)].toolNames[0];

export const copyMapWithDataProperties = (...properties) => Object.keys(map).reduce((newMap, key) => {
  newMap[key] = {};
  properties.forEach((property) => {
    newMap[key][property] = map[key][property];
  });

  return newMap;
}, {});

export const register = (tool, annotationConstructor, customAnnotCheckFunc) => {
  const { toolName, buttonImage, toolObject } = tool;
  const key = toolName;
  const availablePalettes = ['TextColor', 'StrokeColor', 'FillColor'].filter(
    (property) => toolObject.defaults && toolObject.defaults[property],
  );

  map[key] = {
    icon: buttonImage,
    iconColor: availablePalettes[0],
    currentPalette: availablePalettes[0],
    availablePalettes,
    toolNames: [toolName],
    // eslint-disable-next-line no-nested-ternary
    annotationCheck: customAnnotCheckFunc
      ? (annotation) => customAnnotCheckFunc(annotation)
      : annotationConstructor
        ? (annotation) => annotation instanceof annotationConstructor
        : null,
  };
};

// we return an default icon object here to prevent some components from accessing undefined
// if the map doesn't have a key for some annotations
export const getDataWithKey = (key) =>
  map[key] || {
    icon: 'question-noborder',
  };

export const getAnnotationCreateToolNames = () => {
  const toolNames = Object.values(map).reduce(
    (annotationCreateToolNames, { toolNames, annotationCheck }) => (annotationCheck
      ? [...annotationCreateToolNames, ...toolNames]
      : annotationCreateToolNames),
    [],
  );
  toolNames.push('AnnotationEraserTool');

  return toolNames;
};
