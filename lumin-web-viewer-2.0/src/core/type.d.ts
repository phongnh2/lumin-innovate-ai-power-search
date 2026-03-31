export type SearchResult = {
  ambientStr: string;
  resultStr: string;
  resultStrStart: number;
  resultStrEnd: number;
  pageNum: number;
  resultCode: number;
  quads: unknown[];
};

export type Quad = {
  x1: number;
  x2: number;
  x3: number;
  x4: number;
  y1: number;
  y2: number;
  y3: number;
  y4: number;
};

export type WatermarkOptions = {
  diagonal?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    opacity?: number;
    text?: string;
  };
  headerLeft?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    opacity?: number;
    text?: string;
  };
  headerCenter?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    opacity?: number;
    text?: string;
  };
  headerRight?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    opacity?: number;
    text?: string;
  };
  footerLeft?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    opacity?: number;
    text?: string;
  };
  footerCenter?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    opacity?: number;
    text?: string;
  };
  footerRight?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    opacity?: number;
    text?: string;
  };
  custom?: (ctx: CanvasRenderingContext2D, pageIndex: number, pageWidth: number, pageHeight: number) => void;
  shouldDrawOverAnnotations?: boolean;
};

export type PDFCoordinates = {
  x: number;
  y: number;
  pageNumber: number;
};

export type ToolName =
  | 'AnnotationCreateStar'
  | 'AnnotationCreateCross'
  | 'AnnotationCreateTick'
  | Core.Tools.ToolNames
  | 'AnnotationCreateDotStamp'
  | 'AnnotationCreateTickStamp'
  | 'AnnotationCreateCrossStamp'
  | 'AnnotationCreateRedaction'
  | 'AnnotationCreateCalibrationMeasurement'
  | 'AnnotationCreateDistanceMeasurement'
  | 'AnnotationCreateArcMeasurement'
  | 'AnnotationCreatePerimeterMeasurement'
  | 'AnnotationCreateEllipseMeasurement'
  | 'AnnotationCreateRectangularAreaMeasurement'
  | 'AnnotationCreateAreaMeasurement'
  | 'AnnotationCreateDateFreeText'
  | 'AnnotationEdit'
  | 'Pan';

export type PrintablePdfResult = {
  url?: string;
};

export type DrawAnnotationsOption = {
  pageNumber: number;
  overrideCanvas?: HTMLCanvasElement;
  majorRedraw: boolean;
  overrideContainer?: HTMLElement;
};

export type DislayModesTypes = typeof Core.DisplayModes;

export type DisplayModes = keyof DislayModesTypes;

export type PagesInternalAnnotationsTransformHandler = (
  xfdfData: string,
  pageList: number[],
  callback: (xfdf: string) => unknown
) => void;

export type InternalAnnotationsTransformHandler = (xfdfData: string, callback: (xfdf: string) => unknown) => void;

export type PageDimension = {
  rotation: number;
  width: number;
  height: number;
  id: string;
  matrix: number[];
};

export type PageDimensions = Record<number, Record<string, PageDimension>>;

export type ManipulationPageResult = {
  pageDimensions: PageDimensions;
};

export type ZoomToMouseInput = {
  zoomFactor: number;
  offsetX?: number;
  offsetY?: number;
  event?: MouseEvent;
};
