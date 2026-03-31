/* eslint-disable class-methods-use-this */
/* eslint-disable no-constructor-return */
import fireEvent from 'helpers/fireEvent';
import loadScript from 'helpers/loadScript';

import { DataElement } from 'constants/dataElement';

import addAnnotations from './addAnnotations';
import applyRedactions from './applyRedactions';
import cancelLoadThumbnail from './cancelLoadThumbnail';
import canModify from './canModify';
import canModifyContents from './canModifyContents';
import clearSearchResults from './clearSearchResults';
import clearSelection from './clearSelection';
import closeDocument from './closeDocument';
import createAnnotationReply from './createAnnotationReply';
import createFdfDocFromXfdf from './createFdfDocFromXfdf';
import createPDFDocFromBuffer from './createPDFDocFromBuffer';
import cropPages from './cropPages';
import deleteAnnotations from './deleteAnnotations';
import deleteScale from './deleteScale';
import deselectAllAnnotations from './deselectAllAnnotations';
import deselectAnnotation from './deselectAnnotation';
import disableAnnotations from './disableAnnotations';
import disableElements from './disableElements';
import disableFeatures from './disableFeatures';
import disableReadOnlyMode from './disableReadOnlyMode';
import disableRedaction from './disableRedaction';
import disableTools from './disableTools';
import displayAdditionalSearchResult from './displayAdditionalSearchResult';
import displaySearchResult from './displaySearchResult';
import drawAnnotations from './drawAnnotations';
import drawAnnotationsFromList from './drawAnnotationsFromList';
import enableAllElements from './enableAllElements';
import enableAnnotations from './enableAnnotations';
import enableReadOnlyMode from './enableReadOnlyMode';
import enableRedaction from './enableRedaction';
import enableTools from './enableTools';
import { addEventListener, removeEventListener } from './eventListener';
import { EventMapping, CoreEvent } from './eventType';
import exportAnnotations from './exportAnnotations';
import fitToPage from './fitToPage';
import fitToWidth from './fitToWidth';
import fitToZoom from './fitToZoom';
import getAnnotationByMouseEvent from './getAnnotationByMouseEvent';
import getAnnotationManager from './getAnnotationManager';
import getAnnotationsList from './getAnnotationsList';
import getCompleteRotation from './getCompleteRotation';
import getContentEditManager from './getContentEditManager';
import getCurrentPage from './getCurrentPage';
import getCurrentUser from './getCurrentUser';
import getDetectedFieldPlaceholderAnnotations from './getDetectedFieldPlaceholderAnnotations';
import getDisplayAuthor from './getDisplayAuthor';
import getDisplayMode from './getDisplayMode';
import getDisplayModeObject from './getDisplayModeObject';
import getDocument from './getDocument';
import getFieldsList from './getFieldsList';
import getFormFieldCreationManager from './getFormFieldCreationManager';
import getIsReadOnly from './getIsReadOnly';
import getMeasurementManager from './getMeasurementManager';
import getNumberOfGroups from './getNumberOfGroups';
import getOutlines from './getOutlines';
import getPageHeight from './getPageHeight';
import getPageInfo from './getPageInfo';
import getPageWidth from './getPageWidth';
import getPDFCoordinatesFromMouseEvent from './getPDFCoordinatesFromMouseEvent';
import getPrintablePDF from './getPrintablePDF';
import getRotation from './getRotation';
import getScales from './getScales';
import getScrollViewElement from './getScrollViewElement';
import getSearchMode from './getSearchMode';
import getSelectedAnnotations from './getSelectedAnnotations';
import getSelectedText from './getSelectedText';
import getSelectedTextQuads from './getSelectedTextQuads';
import getTextPosition from './getTextPosition';
import getTool from './getTool';
import getToolMode from './getToolMode';
import getToolModeMap from './getToolModeMap';
import getTotalPages from './getTotalPages';
import getViewerCoordinatesFromMouseEvent from './getViewerCoordinatesFromMouseEvent';
import getViewerElement from './getViewerElement';
import getWatermark from './getWatermark';
import getZoom from './getZoom';
import goToOutline from './goToOutline';
import groupAnnotations from './groupAnnotations';
import hideAnnotations from './hideAnnotations';
import insertBlankPages from './insertBlankPages';
import isAnnotationRedactable from './isAnnotationRedactable';
import isAnnotationSelected from './isAnnotationSelected';
import isBlendModeSupported from './isBlendModeSupported';
import isContinuousDisplayMode from './isContinuousDisplayMode';
import isCreateRedactionEnabled from './isCreateRedactionEnabled';
import isDocumentEncrypted from './isDocumentEncrypted';
import isFullPDFEnabled from './isFullPDFEnabled';
import isReadOnlyModeEnabled from './isReadOnlyModeEnabled';
import isUserAdmin from './isUserAdmin';
import isWebViewerServerDocument from './isWebViewerServerDocument';
import jumpToAnnotation from './jumpToAnnotation';
import loadDocument from './loadDocument';
import loadThumbnail from './loadThumbnail';
import mergeDocument from './mergeDocument';
import movePages from './movePages';
import pasteCopiedAnnotations from './pasteCopiedAnnotations';
import redo from './redo';
import refreshAll from './refreshAll';
import removePages from './removePages';
import rotateClockwise from './rotateClockwise';
import rotateCounterClockwise from './rotateCounterClockwise';
import rotatePages from './rotatePages';
import scrollViewUpdated from './scrollViewUpdated';
import selectAnnotation from './selectAnnotation';
import selectAnnotations from './selectAnnotations';
import setActiveSearchResult from './setActiveSearchResult';
import setAnnotationCanvasTransform from './setAnnotationCanvasTransform';
import setAnnotationStyles from './setAnnotationStyles';
import setCurrentPage from './setCurrentPage';
import setCurrentUser from './setCurrentUser';
import setDisplayMode from './setDisplayMode';
import setDocumentXFDFRetriever from './setDocumentXFDFRetriever';
import setFitMode from './setFitMode';
import setInternalAnnotationsTransform from './setInternalAnnotationsTransform';
import setIsAdminUser from './setIsAdminUser';
import setNoteContents from './setNoteContents';
import setPagesUpdatedInternalAnnotationsTransform from './setPagesUpdatedInternalAnnotationsTransform';
import setReadOnly from './setReadOnly';
import setRotation from './setRotation';
import setScrollViewElement from './setScrollViewElement';
import setToolMode from './setToolMode';
import setViewerElement from './setViewerElement';
import setWatermark from './setWatermark';
import setZoomLevel from './setZoomLevel';
import showAnnotations from './showAnnotations';
import textSearchInit from './textSearchInit';
import trigger from './trigger';
import {
  SearchResult,
  WatermarkOptions,
  PDFCoordinates,
  Quad,
  DrawAnnotationsOption,
  ToolName,
  InternalAnnotationsTransformHandler,
  PagesInternalAnnotationsTransformHandler,
  ManipulationPageResult,
  PrintablePdfResult,
  ZoomToMouseInput,
} from './type';
import undo from './undo';
import ungroupAnnotations from './ungroupAnnotations';
import updateCopiedAnnotations from './updateCopiedAnnotations';
import updateToolMode from './updateToolMode';
import updateView from './updateView';
import waitForExitFormBuildMode from './waitForExitFormBuildMode';
import zoomTo from './zoomTo';
import zoomToMouse from './zoomToMouse';
import { store } from '../redux/store';
import { setWebViewerPaths, getPDFNetPath, getFontPath } from '../utils/corePathHelper';

declare global {
  interface Window {
    CoreControls: typeof Core;
  }
}
class PDFCore {
  static instance: PDFCore;

  constructor() {
    if (PDFCore.instance) {
      return PDFCore.instance;
    }
    PDFCore.instance = this;
    this._Events = EventMapping;
    return this;
  }

  _docViewer: Core.DocumentViewer;

  _CoreControls: typeof Core;

  _Events: typeof EventMapping;

  _isInitialized = false;

  set isInitialized(isInitialized: boolean) {
    this._isInitialized = isInitialized;
  }

  set CoreControls(CoreControls: typeof Core) {
    if (CoreControls) this._CoreControls = CoreControls;
  }

  get CoreControls(): typeof Core {
    return this._CoreControls;
  }

  set docViewer(docViewer: Core.DocumentViewer) {
    if (docViewer) this._docViewer = docViewer;
  }

  get docViewer(): Core.DocumentViewer {
    return this._docViewer;
  }

  get Events(): typeof EventMapping {
    return this._Events;
  }

  setUpWorker = async (): Promise<void> => {
    await setWebViewerPaths(window.Core);
    await this.loadFullApi();
    if (!this.docViewer) {
      const docViewer = new window.Core.DocumentViewer();
      this._docViewer = docViewer;
    }
    if (!this.CoreControls) {
      this.CoreControls = window.Core;
    }
  };

  loadFullApi = async (): Promise<void> => {
    if (!window.Core.isFullPDFEnabled()) {
      window.Core.enableFullPDF();
      const pdfNetPath = await getPDFNetPath();
      await loadScript(pdfNetPath);
    }
    await window.Core.PDFNet.initialize(process.env.PDFTRON_LICENSE_KEY);
    const fontPath = await getFontPath();
    await window.Core.PDFNet.WebFontDownloader.setCustomWebFontURL(fontPath);
    this._isInitialized = true;
    fireEvent('coreLoaded');
  };

  waitForSetupCore = async (): Promise<void> => {
    if (!this._isInitialized) {
      await new Promise((resolve) => {
        window.addEventListener(
          'coreLoaded',
          () => {
            resolve(1);
          },
          { once: true }
        );
      });
    }
  };

  waitForExitFormBuildMode = (): Promise<void> => waitForExitFormBuildMode(this._docViewer);

  setToolMode = (toolName: ToolName): void => setToolMode(this._docViewer, toolName);

  getToolMode = (): Core.Tools.Tool => getToolMode(this._docViewer);

  getTool = (toolName: ToolName): Core.Tools.Tool => getTool(this._docViewer, toolName);

  setDisplayMode = (mode: Core.DisplayModes): void => setDisplayMode(this._docViewer, mode);

  getDisplayMode = (): unknown => getDisplayMode(this._docViewer);

  rotateClockwise = (): void => rotateClockwise(this._docViewer);

  rotateCounterClockwise = (): void => rotateCounterClockwise(this._docViewer);

  rotatePages = (arr: number[], rotation: Core.PageRotation): Promise<ManipulationPageResult> =>
    rotatePages(this._docViewer, arr, rotation);

  movePages = (pageArray: number[], newLocation: number): Promise<ManipulationPageResult> =>
    movePages(this._docViewer, pageArray, newLocation);

  removePages = (arr: number[]): Promise<ManipulationPageResult> => removePages(this._docViewer, arr);

  fitToPage = (): void => fitToPage(this._docViewer);

  fitToWidth = (): void => fitToWidth(this._docViewer);

  fitToZoom = (): void => fitToZoom(this._docViewer);

  zoomToMouse = ({ zoomFactor, event, offsetX, offsetY }: ZoomToMouseInput): void =>
    zoomToMouse(this._docViewer, { zoomFactor, event, offsetX, offsetY });

  getZoom = (): number => getZoom(this._docViewer);

  zoomTo = (zoomFactor: number, x?: number, y?: number): void => zoomTo(this._docViewer, zoomFactor, x, y);

  getAnnotationManager = (): Core.AnnotationManager => getAnnotationManager(this._docViewer);

  getTotalPages = (): number => getTotalPages(this._docViewer);

  getCurrentPage = (): number => getCurrentPage(this._docViewer);

  setCurrentPage = (pageNumber: number, isSmoothScroll?: boolean): void =>
    setCurrentPage(this._docViewer, pageNumber, isSmoothScroll);

  isWebViewerServerDocument = (): boolean => isWebViewerServerDocument(this._docViewer);

  getSelectedText = (): string => getSelectedText(this._docViewer);

  clearSelection = (): void => clearSelection(this._docViewer);

  closeDocument = (): void => closeDocument(this._docViewer);

  getToolModeMap = (): Record<Core.Tools.ToolNames, Core.Tools.Tool> => getToolModeMap(this._docViewer);

  getCurrentUser = (): string => getCurrentUser(this._docViewer);

  isUserAdmin = (): boolean => isUserAdmin(this._docViewer);

  setIsAdminUser = (isAdmin: boolean): void => setIsAdminUser(this._docViewer, isAdmin);

  exportAnnotations = (options?: {
    annotList?: Core.Annotations.Annotation[];
    widgets?: boolean;
    links?: boolean;
    fields?: boolean;
    useDisplayAuthor?: boolean;
    generateInlineAppearances?: boolean;
  }): Promise<string> => exportAnnotations(this._docViewer, options);

  setCurrentUser = (userName: string): void => setCurrentUser(this._docViewer, userName);

  setReadOnly = (isReadOnly: boolean): void => setReadOnly(this._docViewer, isReadOnly);

  setScrollViewElement = (element: Element): void => setScrollViewElement(this._docViewer, element);

  setViewerElement = (element: Element): void => setViewerElement(this._docViewer, element);

  isContinuousDisplayMode = (): boolean => isContinuousDisplayMode(this._docViewer);

  scrollViewUpdated = (): void => scrollViewUpdated(this._docViewer);

  canModify = (annotation: Core.Annotations.Annotation): boolean => canModify(this._docViewer, annotation);

  canModifyContents = (annotation: Core.Annotations.Annotation): boolean =>
    canModifyContents(this._docViewer, annotation);

  deleteAnnotations = (
    annotations: Core.Annotations.Annotation[],
    options?: {
      imported?: boolean;
      isUndoRedo?: boolean;
      autoFocus?: boolean;
      source?: string;
      force?: boolean;
    }
  ): void => deleteAnnotations(this._docViewer, annotations, options);

  getDisplayAuthor = (annotationUserId: string): string => getDisplayAuthor(this._docViewer, annotationUserId);

  getDocument = (): Core.Document => getDocument(this._docViewer);

  getCompleteRotation = (pageNumber: number): Core.PageRotation => getCompleteRotation(this._docViewer, pageNumber);

  getRotation = (pageNumber: number): Core.PageRotation => getRotation(this._docViewer, pageNumber);

  getPageInfo = (pageNumber: number): Core.Document.PageInfo => getPageInfo(this._docViewer, pageNumber);

  clearSearchResults = (): void => clearSearchResults(this._docViewer);

  displayAdditionalSearchResult = (result: SearchResult[]): void =>
    displayAdditionalSearchResult(this._docViewer, result);

  displaySearchResult = (result: SearchResult): void => displaySearchResult(this._docViewer, result);

  setActiveSearchResult = (result: SearchResult): void => setActiveSearchResult(this._docViewer, result);

  textSearchInit = (
    pattern: string,
    mode: number,
    searchOptions?: {
      fullSearch?: boolean;
      onResult?: (...params: unknown[]) => unknown;
      onPageEnd?: (...params: unknown[]) => unknown;
      onDocumentEnd?: (...params: unknown[]) => unknown;
      onError?: (...params: unknown[]) => unknown;
      startPage?: number;
      endPage?: number;
    }
  ): void => textSearchInit(this._docViewer, pattern, mode, searchOptions);

  getSearchMode = (): typeof Core.Search.Mode => getSearchMode(this._CoreControls);

  getPageWidth = (pageNumber: number): number => getPageWidth(this._docViewer, pageNumber);

  getPageHeight = (pageNumber: number): number => getPageHeight(this._docViewer, pageNumber);

  drawAnnotations = (options: DrawAnnotationsOption): Promise<void> => drawAnnotations(this._docViewer, options);

  getOutlines = (): Promise<Core.Bookmark[]> => getOutlines(this._docViewer);

  getSelectedAnnotations = (): Core.Annotations.Annotation[] => getSelectedAnnotations(this._docViewer);

  updateCopiedAnnotations = (): void => updateCopiedAnnotations(this._docViewer);

  pasteCopiedAnnotations = (useMouseLocation?: boolean): void =>
    pasteCopiedAnnotations(this._docViewer, useMouseLocation);

  selectAnnotation = (annotation: Core.Annotations.Annotation): void => selectAnnotation(this._docViewer, annotation);

  selectAnnotations = (annotations: Core.Annotations.Annotation[]): void =>
    selectAnnotations(this._docViewer, annotations);

  addAnnotations = (
    annotations: Core.Annotations.Annotation[],
    options?: {
      imported?: boolean;
      isUndoRedo?: boolean;
      autoFocus?: boolean;
      source?: string;
    }
  ): void => addAnnotations(this._docViewer, annotations, options);

  applyRedactions = (
    annotations: Core.Annotations.Annotation[]
  ): Promise<string | Core.AnnotationManager.RedactionInfo[]> => applyRedactions(this._docViewer, annotations);

  isCreateRedactionEnabled = (): boolean => isCreateRedactionEnabled(this._docViewer);

  isAnnotationRedactable = (annotation: Core.Annotations.Annotation): boolean =>
    isAnnotationRedactable(this._docViewer, annotation);

  enableRedaction = (): void => enableRedaction(this._docViewer);

  drawAnnotationsFromList = (annotations: Core.Annotations.Annotation[]): Promise<void> =>
    drawAnnotationsFromList(this._docViewer, annotations);

  setInternalAnnotationsTransform = (callback: InternalAnnotationsTransformHandler): void =>
    setInternalAnnotationsTransform(this._docViewer, callback);

  setPagesUpdatedInternalAnnotationsTransform = (callback: PagesInternalAnnotationsTransformHandler): void =>
    setPagesUpdatedInternalAnnotationsTransform(this._docViewer, callback);

  loadDocument = (
    src: string | Core.Document | File | Blob | ArrayBuffer | Core.PDFNet.PDFDoc,
    options?: Core.CreateDocumentOptions
  ): Promise<void> => loadDocument(this._docViewer, src, options);

  loadThumbnail = (pageNum: number, callback: (...params: unknown[]) => unknown): string =>
    loadThumbnail(this._docViewer, pageNum, callback);

  getSelectedTextQuads = (): Quad[] => getSelectedTextQuads(this._docViewer);

  getDisplayModeObject = (): Core.DisplayMode => getDisplayModeObject(this._docViewer);

  getScrollViewElement = (): Element => getScrollViewElement(this._docViewer);

  getAnnotationByMouseEvent = (e: MouseEvent): Core.Annotations.Annotation =>
    getAnnotationByMouseEvent(this._docViewer, e);

  isFullPDFEnabled = (): boolean => isFullPDFEnabled(this._CoreControls);

  isBlendModeSupported = (type: string): boolean => isBlendModeSupported(type);

  isAnnotationSelected = (annotation: Core.Annotations.Annotation): boolean =>
    isAnnotationSelected(this._docViewer, annotation);

  setAnnotationStyles = (annotation: Core.Annotations.Annotation, callback: unknown): void =>
    setAnnotationStyles(this._docViewer, annotation, callback);

  deselectAnnotation = (annotation: Core.Annotations.Annotation): void =>
    deselectAnnotation(this._docViewer, annotation);

  deselectAllAnnotations = (): void => deselectAllAnnotations(this._docViewer);

  jumpToAnnotation = (
    annotation: Core.Annotations.Annotation,
    options?: {
      horizontalOffset?: string;
      verticalOffset?: string;
      zoom?: string;
      fitToView?: boolean;
      isSmoothScroll?: boolean;
    }
  ): void => jumpToAnnotation(this._docViewer, annotation, options);

  createAnnotationReply = (annotation: Core.Annotations.Annotation, reply: string): Core.Annotations.StickyAnnotation =>
    createAnnotationReply(this._docViewer, annotation, reply);

  getIsReadOnly = (): boolean => getIsReadOnly(this._docViewer);

  setNoteContents = (annotation: Core.Annotations.Annotation, content: string): void =>
    setNoteContents(this._docViewer, annotation, content);

  getAnnotationsList = (): Core.Annotations.Annotation[] => getAnnotationsList(this._docViewer);

  getDetectedFieldPlaceholderAnnotations = (): Core.Annotations.Annotation[] =>
    getDetectedFieldPlaceholderAnnotations(this._docViewer);

  getPrintablePDF = (): Promise<PrintablePdfResult> | null => getPrintablePDF(this._docViewer);

  cancelLoadThumbnail = (requestId: number): void => cancelLoadThumbnail(this._docViewer, requestId);

  showAnnotations = (annotations: Core.Annotations.Annotation[]): void => showAnnotations(this._docViewer, annotations);

  hideAnnotations = (annotations: Core.Annotations.Annotation[]): void => hideAnnotations(this._docViewer, annotations);

  goToOutline = (outline: Core.Bookmark): void => goToOutline(this._docViewer, outline);

  getViewerElement = (): Element => getViewerElement(this._docViewer);

  addEventListener = (
    event: CoreEvent,
    eventListener: (...params: unknown[]) => unknown,
    options?: { once: boolean }
  ): void => addEventListener(this._docViewer, event, eventListener, options);

  removeEventListener = (event: CoreEvent, eventListener: (...params: unknown[]) => unknown): void =>
    removeEventListener(this._docViewer, event, eventListener);

  setAnnotationCanvasTransform = (
    annotCanvasContext: CanvasRenderingContext2D,
    zoom: number,
    rotation: Core.PageRotation
  ): void => setAnnotationCanvasTransform(this._docViewer, annotCanvasContext, zoom, rotation);

  setWatermark = (watermarkOptions: WatermarkOptions): Promise<void> => setWatermark(this._docViewer, watermarkOptions);

  getWatermark = (): Promise<WatermarkOptions> => getWatermark(this._docViewer);

  groupAnnotations = (
    primaryAnnotation: Core.Annotations.Annotation,
    annotations: Core.Annotations.Annotation[]
  ): void => groupAnnotations(this._docViewer, primaryAnnotation, annotations);

  ungroupAnnotations = (annotations: Core.Annotations.Annotation[]): void =>
    ungroupAnnotations(this._docViewer, annotations);

  getNumberOfGroups = (annotations: Core.Annotations.Annotation[]): number =>
    getNumberOfGroups(this._docViewer, annotations);

  undo = (): Promise<void> => undo(this._docViewer);

  redo = (): Promise<void> => redo(this._docViewer);

  insertBlankPages = (pageArray: number[], sizePage: Core.Document.PageInfo): Promise<ManipulationPageResult> =>
    insertBlankPages(this._docViewer, pageArray, sizePage);

  cropPages = (
    pageArray: number[],
    topMargin: number,
    botMargin: number,
    leftMargin: number,
    rightMargin: number
  ): Promise<ManipulationPageResult> =>
    cropPages(this._docViewer, pageArray, topMargin, botMargin, leftMargin, rightMargin);

  mergeDocument = (source: string | File | Blob | ArrayBuffer, position?: number): Promise<unknown> =>
    mergeDocument(this._docViewer, source, position);

  refreshAll = (): void => refreshAll(this._docViewer);

  trigger = (event: string | number, data?: unknown): unknown => trigger(this._docViewer, event, data);

  updateView = (visiblePages?: number[], currentPageNumber?: number): void =>
    updateView(this._docViewer, visiblePages, currentPageNumber);

  disableFeatures = (): ((features: DataElement | DataElement[]) => void) => disableFeatures(store);

  disableTools = (toolArray: ToolName[] = []): void => disableTools(toolArray, store);

  enableTools = (toolArray: ToolName[] = []): void => enableTools(toolArray, store);

  disableElements = (dataElements: DataElement[]): void => disableElements(store, dataElements);

  enableAllElements = (): void => enableAllElements(store);

  updateToolMode = (toolName: ToolName): void => updateToolMode(store, toolName);

  setZoomLevel = (zoomLevel: number): void => setZoomLevel(zoomLevel);

  setFitMode = (mode: string): void => setFitMode(mode);

  disableReadOnlyMode = (): void => disableReadOnlyMode(this._docViewer);

  enableReadOnlyMode = (): void => enableReadOnlyMode(this._docViewer);

  disableRedaction = (): void => disableRedaction(this._docViewer);

  isReadOnlyModeEnabled = (): boolean => isReadOnlyModeEnabled(this._docViewer);

  getFormFieldCreationManager = (): Core.FormFieldCreationManager => getFormFieldCreationManager(this._docViewer);

  enableAnnotations = (): void => enableAnnotations(this._docViewer);

  disableAnnotations = (): void => disableAnnotations(this._docViewer);

  getViewerCoordinatesFromMouseEvent = (event: MouseEvent): PDFCoordinates =>
    getViewerCoordinatesFromMouseEvent(this._docViewer, event);

  getPDFCoordinatesFromMouseEvent = (event: MouseEvent): PDFCoordinates =>
    getPDFCoordinatesFromMouseEvent(this._docViewer, event);

  getContentEditManager = (): Core.ContentEditManager => getContentEditManager(this._docViewer);

  runWithCleanup = <T>(callback: (...params: unknown[]) => T): Promise<T> =>
    window.Core.PDFNet.runWithCleanup(callback, process.env.PDFTRON_LICENSE_KEY) as Promise<T>;

  runWithoutCleanup = <T>(callback: (...params: unknown[]) => T): Promise<T> =>
    window.Core.PDFNet.runWithoutCleanup(callback, process.env.PDFTRON_LICENSE_KEY) as Promise<T>;

  createFdfDocFromXfdf = (xfdf: string): Promise<Core.PDFNet.FDFDoc> => createFdfDocFromXfdf(xfdf);

  createPDFDocFromBuffer = (
    buffer: ArrayBuffer | Int8Array | Uint8Array | Uint8ClampedArray
  ): Promise<Core.PDFNet.PDFDoc> => createPDFDocFromBuffer(buffer);

  setRotation = (rotation: Core.PageRotation): void => setRotation(this._docViewer, rotation);

  getFieldsList = (): Core.Annotations.Forms.Field[] => getFieldsList(this._docViewer);

  setDocumentXFDFRetriever = (retriever: Core.DocumentViewer.DocumentXFDFRetriever | null): Promise<void> =>
    setDocumentXFDFRetriever(this._docViewer, retriever);

  getTextPosition = (pageNumber: number, textStartIndex: number, textEndIndex: number): Promise<object[]> =>
    getTextPosition(this._docViewer, pageNumber, textStartIndex, textEndIndex);

  getMeasurementManager = (): Core.MeasurementManager => getMeasurementManager(this._docViewer);

  getScales = () => getScales(this._docViewer);

  deleteScale = (scale: Core.Scale) => deleteScale(this._docViewer, scale);

  isDocumentEncrypted = () => isDocumentEncrypted(this._docViewer);
}

export default new PDFCore();
