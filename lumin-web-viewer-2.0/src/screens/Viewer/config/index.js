/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable func-names */
/* eslint-disable operator-assignment */
/* eslint-disable prefer-rest-params */
/* eslint-disable no-constructor-return */
/* eslint-disable class-methods-use-this */

import React from 'react';

import actions from 'actions';
import core from 'core';

import WarningHyperlinkContent from 'lumin-components/WarningHyperlinkContent';
import {
  STANDARD_STAMP_HEIGHT_DEFAULT,
  RUBBER_STAMP_FOLDER_DEFAULT,
  ORIGINAL_URL_KEY,
  ORIGINAL_URL_CUSTOM_KEY,
} from 'luminComponents/RubberStampOverlay/constants';

import CrossAnnotation from 'helpers/CustomAnnotation/CrossAnnotation';
import StarAnnotation from 'helpers/CustomAnnotation/StarAnnotation';
import TickAnnotation from 'helpers/CustomAnnotation/TickAnnotation';
import mentionsManager from 'helpers/MentionsManager';
import { ToolSwitchableChecker } from 'helpers/toolSwitchableChecker';

import {
  drawStickyAnnotation,
  initStickyAnnotationSize,
  testCommentAnnotationDimension,
  getCommentDimension,
  drawCommentSelectionOutline,
} from 'features/Comments/core';
import { configFreetextSerialization } from 'features/Freetext/serialization';
import { shortcutsMap } from 'features/Freetext/shortcuts';
import { configMeasureToolSerialization } from 'features/MeasureTool/utils';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT, CUSTOM_DATA_FREETEXT } from 'constants/customDataConstant';
import { DataElements } from 'constants/dataElement';
import {
  CUSTOM_ANNOTATION,
  ANNOTATION_SUBJECT_MUST_BE_CONVERTED_TO_SIGNED_URL,
  PDF_ACTION_TYPE,
  AnnotationSubjectMapping,
  DefaultSelectionOutlineColor,
  CommentOutlineColor,
  TextHandleColor,
  AnnotationOutlineColor,
  DefaultHandleColor,
  FreeTextHandleColor,
} from 'constants/documentConstants';
import { ModalTypes } from 'constants/lumin-common';
import TOOLS_NAME, { TOOLS_TRIGGER_LOAD_DOCUMENT } from 'constants/toolsName';

import { overrideDeleteAnnotations } from './annotationManager';
import { autoDetectFormFieldsConfig } from './autoDetectFormFieldsConfig';
import formFieldConfig from './formFieldConfig';
import { store } from '../../../redux/store';
import LUniqueAnnotation from '../CustomAnnotation/LUniqueAnnotation';

const CACHING_LEVEL = 10;

const MAX_FREETEXT_PADDING = 12;
const MIN_FREETEXT_PADDING = 6;
const DEFAULT_FREETEXT_PADDING = 10;
const PADDING_RATIO = 0.75;

export default class Config {
  constructor(t) {
    this.t = t;
    if (Config.instance) {
      return Config.instance;
    }

    Config.instance = this;
    this.tools = [
      window.Core.Tools.AnnotationEditTool,
      window.Core.Tools.AreaMeasurementCreateTool,
      window.Core.Tools.ArrowCreateTool,
      window.Core.Tools.CalloutCreateTool,
      window.Core.Tools.DistanceMeasurementCreateTool,
      window.Core.Tools.EllipseCreateTool,
      window.Core.Tools.EraserTool,
      window.Core.Tools.FreeHandCreateTool,
      window.Core.Tools.FreeTextCreateTool,
      window.Core.Tools.LineCreateTool,
      window.Core.Tools.MarqueeZoomTool,
      window.Core.Tools.PerimeterMeasurementCreateTool,
      window.Core.Tools.RectangleCreateTool,
      window.Core.Tools.RedactionCreateTool,
      window.Core.Tools.StickyCreateTool,
      window.Core.Tools.TextAnnotationCreateTool,
      window.Core.Tools.TextHighlightCreateTool,
      window.Core.Tools.TextSelectTool,
      window.Core.Tools.TextSquigglyCreateTool,
      window.Core.Tools.TextStrikeoutCreateTool,
      window.Core.Tools.TextTool,
      window.Core.Tools.TextUnderlineCreateTool,
    ];
    this.genericTools = [
      window.Core.Tools.PolygonCloudCreateTool,
      window.Core.Tools.PolygonCreateTool,
      window.Core.Tools.PolylineCreateTool,
    ];
    this.freeTextDom = [];
    this.specificToolActive = false;
    this.fields = new Set();
    this.autoCreateText = 0;

    this.overrideTools();

    formFieldConfig(store);
    const annotManager = core.getAnnotationManager();
    autoDetectFormFieldsConfig({ annotManager });
    this.overrideAnnotationMethod(t);

    window.Core.Tools.SignatureCreateTool.setTextHandler(() => t('message.signHere'));
    window.Core.Tools.FreeTextCreateTool.setTextHandler(() => t('message.insertTextHere'));

    CrossAnnotation.prototype.elementName = CUSTOM_ANNOTATION.CROSS.name;
    StarAnnotation.prototype.elementName = CUSTOM_ANNOTATION.STAR.name;
    TickAnnotation.prototype.elementName = CUSTOM_ANNOTATION.TICK.name;
    LUniqueAnnotation.prototype.elementName = 'lunique';

    annotManager.registerAnnotationType(StarAnnotation.prototype.elementName, StarAnnotation);
    annotManager.registerAnnotationType(CrossAnnotation.prototype.elementName, CrossAnnotation);
    annotManager.registerAnnotationType(TickAnnotation.prototype.elementName, TickAnnotation);
    annotManager.registerAnnotationType(LUniqueAnnotation.prototype.elementName, LUniqueAnnotation);

    core.CoreControls.setCachingLevel(CACHING_LEVEL);
    mentionsManager.initialize(store, core.getAnnotationManager());

    initStickyAnnotationSize();

    return this;
  }

  onAnnotationSelected = () => {
    /*
    Defines the default color for the annotation selection outline:
       Default ControlHandle.color: R: 49, G: 131, B: 200, A: 1
       Default ControlHandle.outlineColor: R: 49, G: 131, B: 200, A: 1
     SelectionModel.defaultSelectionOutlineColor
       Comment - #035970 # rgb(3, 89, 112, 1)
     - Free text -#4690A4 # rgb(70, 144, 164)
     ControlHandle.color:
       Free text #ffffff
       others #4690A4 primary-80
     ControlHandle.outlineColor:
       Free text #4690A4 # rgb(70, 144, 164)
       others #9EB6C7 rgb(158, 182, 199) netral-40
    */
    const { SelectionModel, Color, ControlHandle } = core.CoreControls.Annotations;
    const annotationName = core.getSelectedAnnotations()[0]?.Subject;

    if (annotationName === 'Free text') {
      ControlHandle.color = new Color(FreeTextHandleColor.R, FreeTextHandleColor.G, FreeTextHandleColor.B, 1);
    } else {
      ControlHandle.color = new Color(DefaultHandleColor.R, DefaultHandleColor.G, DefaultHandleColor.B);
    }
    ControlHandle.outlineColor = new Color(
      AnnotationOutlineColor.R,
      AnnotationOutlineColor.G,
      AnnotationOutlineColor.B
    );
    // Click on the page to start selecting text
    if (!annotationName) {
      ControlHandle.color = new Color(TextHandleColor.R, TextHandleColor.G, TextHandleColor.B);
    }

    if (annotationName === 'Comment') {
      SelectionModel.defaultSelectionOutlineColor = new Color(
        CommentOutlineColor.R,
        CommentOutlineColor.G,
        CommentOutlineColor.B,
        1
      );
    } else {
      SelectionModel.defaultSelectionOutlineColor = new Color(
        DefaultSelectionOutlineColor.R,
        DefaultSelectionOutlineColor.G,
        DefaultSelectionOutlineColor.B,
        1
      );
    }
  };

  overrideTools = () => {
    /* FIX SIGNATURE TOOL NOT SHOW PREVIEW CORE VERSION 8.12.1 */
    window.Core.Tools.SignatureCreateTool.prototype.clearPreviewSignatureElement = function () {
      Object.entries(this).forEach(([key, value]) => {
        const isDivEl = value instanceof HTMLDivElement;
        if (isDivEl && value.id === 'signature-preview') {
          value.remove();
          delete this[key];
        }
      });
    };

    window.Core.Tools.FreeHandCreateTool.prototype.createDelay = 0;

    const originalRedactionToolMouseLeftDown = window.Core.Tools.RedactionCreateTool.prototype.mouseLeftDown;
    window.Core.Tools.RedactionCreateTool.prototype.mouseLeftDown = function () {
      if (core.getSelectedAnnotations().length > 0) {
        window.Core.Tools.AnnotationEditTool.prototype.mouseLeftDown.call(this, ...arguments);
      } else {
        originalRedactionToolMouseLeftDown.call(this, ...arguments);
      }
    };

    const originalSetToolMode = window.Core.DocumentViewer.prototype.setToolMode;
    window.Core.DocumentViewer.prototype.setToolMode = function (tool) {
      if (!TOOLS_TRIGGER_LOAD_DOCUMENT.includes(tool?.name)) {
        originalSetToolMode.call(this, ...arguments);
        return;
      }
      if (!ToolSwitchableChecker.isAnnotationLoaded()) {
        ToolSwitchableChecker.showWarningMessage();
        return;
      }
      if (ToolSwitchableChecker.isDocumentSyncing() || !ToolSwitchableChecker.isAnnotationLoaded()) {
        core.setToolMode(TOOLS_NAME.EDIT);
        store.dispatch(actions.setActiveToolGroup(''));
        return;
      }
      originalSetToolMode.call(this, ...arguments);
    };

    const originalFreetextToolMouseLeftDown = window.Core.Tools.FreeTextCreateTool.prototype.mouseLeftDown;
    window.Core.Tools.FreeTextCreateTool.prototype.mouseLeftDown = function () {
      originalFreetextToolMouseLeftDown.call(this, ...arguments);
      store.dispatch(actions.closeElement(DataElements.FREETEXT_PREVIEW));
    };

    const originalFreetextToolMouseLeftUp = window.Core.Tools.FreeTextCreateTool.prototype.mouseLeftUp;
    window.Core.Tools.FreeTextCreateTool.prototype.mouseLeftUp = function () {
      originalFreetextToolMouseLeftUp.call(this, ...arguments);
      store.dispatch(actions.openElement(DataElements.FREETEXT_PREVIEW));
    };

    window.Core.Tools.RubberStampCreateTool.prototype.getPreviewElement = function () {
      return Object.values(this).find((value) => value instanceof HTMLElement && value.id === 'rubberstamp-preview');
    };
  };

  initialFreeTextDomArray = () => {
    this.freeTextDom = Array(core.getTotalPages()).fill({});
  };

  keepFreeTextDomElement = (annotations, action, { imported }) => {
    if (action === 'delete' || imported) {
      return;
    }
    const freeTextAnnots = annotations.filter((annot) => annot instanceof window.Core.Annotations.FreeTextAnnotation);
    core.selectAnnotations(freeTextAnnots);
    freeTextAnnots.map((freeText) => {
      const { Id, PageNumber } = freeText;
      const freeTextDomEl = document.getElementById(`freetext-editor-${Id}`);
      if (freeTextDomEl) {
        this.freeTextDom[PageNumber - 1] = {
          ...this.freeTextDom[PageNumber - 1],
          [Id]: freeTextDomEl,
        };
      }
    });
  };

  appendFreeTextDomElement = (page) => {
    const freeText = this.freeTextDom[page];
    if (!freeText) return;
    const freeTextList = Object.keys(freeText);
    if (freeTextList.length) {
      freeTextList.forEach((textId) => {
        if (
          document.getElementById(`freetext-editor-${textId}`) ||
          !core.getAnnotationManager().getAnnotationById(textId)
        ) {
          return;
        }
        const pageWidget = document.getElementById(`pageWidgetContainer${page}`);
        if (pageWidget && freeText[textId]) {
          pageWidget.appendChild(freeText[textId]);
        }
      });
    }
  };

  destructor = () => {
    core.docViewer.removeEventListener('native_manipUpdated', this.initialFreeTextDomArray);
    core.docViewer.removeEventListener('pageComplete', this.appendFreeTextDomElement);
    core.removeEventListener('annotationChanged', this.keepFreeTextDomElement);
    core.removeEventListener('annotationSelected', this.onAnnotationSelected);
  };

  overrideHighlightColor() {
    /* Sets the color to use when highlighting text from searching. */
    core.docViewer.setSearchHighlightColors({
      searchResult: 'rgba(250, 177, 165, 0.8)', // #FAB1A5
      activeSearchResult: 'rgba(218, 102, 104, 0.8)', // #DA6668
    });
    /* end */

    /* Sets the color to use when highlighting text from text selection. */
    core.docViewer.setTextHighlightColor('rgba(119, 194, 215, 0.24)');
    /* end */
  }

  addEventListener() {
    // fix zoom with freetext
    core.addEventListener('annotationChanged', this.keepFreeTextDomElement);
    core.docViewer.addEventListener('pageComplete', this.appendFreeTextDomElement);
    core.docViewer.addEventListener('native_manipUpdated', this.initialFreeTextDomArray);
    core.addEventListener('annotationSelected', this.onAnnotationSelected);
  }

  overrideAnnotationMethod(t) {
    overrideDeleteAnnotations(t);
    configFreetextSerialization();
    configMeasureToolSerialization();
    window.Core.Annotations.StickyAnnotation.prototype.draw = drawStickyAnnotation;

    const originalFreehandDeserialize = window.Core.Annotations.FreeHandAnnotation.prototype.deserialize;
    window.Core.Annotations.FreeHandAnnotation.prototype.deserialize = function () {
      originalFreehandDeserialize.apply(this, arguments);
      if (this.Subject === AnnotationSubjectMapping.freehandHighlight) {
        this.ToolName = TOOLS_NAME.FREEHAND_HIGHLIGHT;
      }
    };

    const originalStampDeserialize = window.Core.Annotations.StampAnnotation.prototype.deserialize;
    window.Core.Annotations.StampAnnotation.prototype.deserialize = function () {
      originalStampDeserialize.apply(this, arguments);
      switch (this.Subject) {
        case AnnotationSubjectMapping.crossStamp:
          this.ToolName = TOOLS_NAME.CROSS_STAMP;
          break;
        case AnnotationSubjectMapping.dotStamp:
          this.ToolName = TOOLS_NAME.DOT_STAMP;
          break;
        case AnnotationSubjectMapping.tickStamp:
          this.ToolName = TOOLS_NAME.TICK_STAMP;
          break;
        case AnnotationSubjectMapping.signature:
          this.ToolName = TOOLS_NAME.SIGNATURE;
          break;
        default:
          break;
      }
    };

    // fix zoom with freetext
    const originalGetContents = window.Core.Annotations.FreeTextAnnotation.RichTextEditor.prototype.getContents;
    window.Core.Annotations.FreeTextAnnotation.RichTextEditor.prototype.getContents = function () {
      if (originalGetContents) {
        return originalGetContents.call(this, ...arguments);
      }

      return '';
    };

    /**
     * TEMPORARY FIX FOR LMV-4844: Need to call FreeTextAnnotation.NE and FreeTextAnnotation.hj to get the line count of the freetext annotation
     * because Apryse core API does not expose meaningful named API for these functions.
     * We can remove this code when Apryse core fix this bug on their 11.1 version.
     */
    window.Core.Annotations.FreeTextAnnotation.prototype.countLines = function () {
      const wrappedTextLines = this.getCustomData(CUSTOM_DATA_FREETEXT.WRAPPED_TEXT_LINES.key);
      if (!wrappedTextLines) {
        return 0;
      }
      return JSON.parse(wrappedTextLines).length;
    };

    /*
      END
    */

    const originalDraw = window.Core.Annotations.FreeTextAnnotation.prototype.draw;
    window.Core.Annotations.FreeTextAnnotation.prototype.draw = function (context, pageMatrix) {
      const font = this.Font;
      const defaultFont = this.originalDefaultStyle?.split(' ')[1];
      if (defaultFont === 'Helvetica' && font === 'Arial') {
        this.Font = defaultFont;
      }
      if (this.ToolName === 'AnnotationCreateDateFreeText' || this.getDateFormat()) {
        const editor = this.getEditor();
        if (editor?.hasFocus()) {
          editor.editor.blur();
        }
      }
      originalDraw.call(this, ...arguments);
      this.maxLineWidth = Math.max(
        ...this.getContents()
          .split('\n')
          .map((line) => context.measureText(line).width)
      );
      /* TEMPORARY FIX FOR LMV-4844 */
      this.linesCount = this.countLines(context, pageMatrix);
      /* END */
    };

    window.Core.Annotations.FreeTextAnnotation.RichTextEditor.setEditorOptions({
      modules: {
        keyboard: {
          bindings: shortcutsMap,
        },
      },
    });

    const ellipseCreateToolDraw = window.Core.Annotations.EllipseAnnotation.prototype.draw;
    window.Core.Annotations.EllipseAnnotation.prototype.draw = function (ctx) {
      ellipseCreateToolDraw.call(this, ...arguments);
      this.disableRotationControl();
    };

    const drawPlaceholder = (annot, context) => {
      const rotationAngle = window.Core.Annotations.RotationUtils.getRotationAngleInRadiansByDegrees(annot.Rotation);
      const { x, y, height, width } =
        window.Core.Annotations.RotationUtils.getUnrotatedDimensionsFromRectangularAnnotations(
          annot.getRect(),
          rotationAngle
        );
      context.fillStyle = getComputedStyle(document.body).getPropertyValue('--color-neutral-20');
      context.translate(x + width / 2, y + height / 2);
      context.rotate(-rotationAngle);
      context.translate(-width / 2, -height / 2);
      context.fillRect(0, 0, width, height);
      context.drawImage(annot.image, width / 2 - annot.image.width / 2, height / 2 - annot.image.height / 2);
    };

    const stampCreateToolDraw = window.Core.Annotations.StampAnnotation.prototype.draw;
    window.Core.Annotations.StampAnnotation.prototype.draw = function (ctx) {
      const annot = this;
      if (ANNOTATION_SUBJECT_MUST_BE_CONVERTED_TO_SIGNED_URL.includes(annot.Subject) && annot.showPlaceholder) {
        drawPlaceholder(annot, ctx);
        return;
      }
      // fix standard rubber stamp oversize
      // this patch should be remove after apryse public set size for stamp preview
      const originalUrl = this.getCustomData(ORIGINAL_URL_KEY);
      if (originalUrl.includes(RUBBER_STAMP_FOLDER_DEFAULT)) {
        const standardStampHeight = STANDARD_STAMP_HEIGHT_DEFAULT / core.getZoom();
        this.Width = (this.Width / this.Height) * standardStampHeight;
        this.Height = standardStampHeight;
        this.setCustomData(ORIGINAL_URL_CUSTOM_KEY, originalUrl);
        this.deleteCustomData(ORIGINAL_URL_KEY);
      }
      stampCreateToolDraw.call(this, ...arguments);
    };

    // end
    const originalDrawBoxControl = window.Core.Annotations.BoxControlHandle.prototype.draw;
    window.Core.Annotations.BoxControlHandle.prototype.draw = function () {
      const zoom = core.getZoom();
      const DEFAULT_ZOOM = 1;
      const DEFAULT_RATIO_DOT_SIZE = 10;
      this.width = zoom < DEFAULT_ZOOM ? zoom * DEFAULT_RATIO_DOT_SIZE : DEFAULT_RATIO_DOT_SIZE;
      this.height = zoom < DEFAULT_ZOOM ? zoom * DEFAULT_RATIO_DOT_SIZE : DEFAULT_RATIO_DOT_SIZE;
      originalDrawBoxControl.call(this, ...arguments);
    };

    window.Core.Actions.GoTo.prototype.onTriggered = function (linkAnnotation) {
      if (!(linkAnnotation instanceof window.Core.Annotations.Link)) {
        return;
      }
      const annotManager = core.getAnnotationManager();
      const groupedAnnotations = annotManager.getGroupAnnotations(linkAnnotation);
      const otherAnnotation = groupedAnnotations.find(
        (annotation) => annotation.Id !== linkAnnotation.Id && !(annotation instanceof window.Core.Annotations.Link)
      );
      if (otherAnnotation) {
        return;
      }

      if (linkAnnotation.Listable) {
        core.selectAnnotation(linkAnnotation);
        return;
      }

      const action = linkAnnotation.getActions()[PDF_ACTION_TYPE.MOUSE_RELEASED];

      if (!action?.length) {
        return;
      }

      const destPageNumber = action[0].dest.page;
      if (parseInt(destPageNumber) > 0) {
        core.setCurrentPage(parseInt(destPageNumber));
      }
    };

    window.Core.Actions.URI.prototype.onTriggered = function (annot) {
      const isLinkAnnotation = annot && annot.Subject === 'Link';
      const action = annot.getActions()[PDF_ACTION_TYPE.MOUSE_RELEASED];
      if (!action?.length) {
        return;
      }
      const url = action[0].uri;
      const regexMailTo = /^mailto:/;
      if (regexMailTo.test(url) && !isLinkAnnotation) {
        showWarningNavigateUrlModal(t, url);
        return;
      }
      const urlHasProtocol = url.startsWith('http') ? url : `https://${url}`;
      // eslint-disable-next-line no-useless-escape
      const regexUrlPattern = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.%]+$/gm;
      if (regexUrlPattern.test(urlHasProtocol) && !isLinkAnnotation) {
        const urlObject = new URL(urlHasProtocol);

        const domain = urlObject.hostname.replace('www.', '');
        const domainRegex = /^([-\w]+\.){0,1}luminpdf.com$/;
        if (!domainRegex.test(domain)) {
          showWarningNavigateUrlModal(t, urlObject.href);
        } else {
          window.open(urlObject.href, '_blank', 'noopener,noreferrer');
        }
      }
    };

    window.Core.Annotations.StickyAnnotation.prototype.selectionModel = window.Core.Annotations.SelectionModel;

    window.Core.Annotations.SelectionModel.selectionOutlineExtraPadding = 0;

    window.Core.Annotations.SelectionModel.setCustomHandlers(window.Core.Annotations.SelectionModel, {
      drawSelectionOutline(ctx, annotation, zoom, pageMatrix, { selectionModel, originalDrawSelectionOutline }) {
        if (annotation instanceof window.Core.Annotations.StickyAnnotation) {
          drawCommentSelectionOutline({ annotation, ctx, zoom });
          return;
        }
        originalDrawSelectionOutline(ctx, annotation, zoom, pageMatrix);
      },
      testSelection(annotation, x, y, pageMatrix, zoom, rotation, { originalTestSelection }) {
        if (annotation instanceof window.Core.Annotations.StickyAnnotation) {
          return testCommentAnnotationDimension({ annotation, x, y, zoom, rotation });
        }
        return originalTestSelection(annotation, x, y, pageMatrix, zoom, rotation);
      },
      getDimensions(annotation, { selectionModel, originalGetDimensions }) {
        if (annotation instanceof window.Core.Annotations.StickyAnnotation) {
          return getCommentDimension(annotation);
        }
        return originalGetDimensions(annotation);
      },
    });
    window.Core.Annotations.SelectionModel.setCustomHandlers(window.Core.Annotations.BoxSelectionModel, {
      testSelection(annotation, x, y, pageMatrix, zoom, rotation, { originalTestSelection }) {
        if (
          annotation instanceof window.Core.Annotations.WidgetAnnotation &&
          core.getFormFieldCreationManager().isInFormFieldCreationMode()
        ) {
          return window.Core.Annotations.SelectionAlgorithm.boundingRectTest(annotation, x, y, zoom);
        }
        return originalTestSelection(annotation, x, y, pageMatrix, zoom, rotation);
      },
    });

    // By setting comments as highlight notes, they will be compatible and visible in other apps
    const textHighlightAnnotationDraw = window.Core.Annotations.TextHighlightAnnotation.prototype.draw;
    window.Core.Annotations.TextHighlightAnnotation.prototype.draw = function () {
      const stickyLinkId = this.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key);
      if (stickyLinkId) {
        const annotManager = core.getAnnotationManager();
        const sticky = annotManager.getAnnotationById(stickyLinkId);
        if (sticky) {
          this.setContents(sticky.getContents());
          const replies = sticky.getReplies();
          replies.forEach((rep) => {
            const copiedReply = annotManager.getAnnotationCopy(rep);
            copiedReply.InReplyTo = this.Id;
            this.addReply(rep);
          });
        }
      }
      textHighlightAnnotationDraw.call(this, ...arguments);
    };
  }
}

function showWarningNavigateUrlModal(t, url) {
  store.dispatch(
    actions.openViewerModal({
      type: ModalTypes.WARNING,
      title: t('viewer.annotationPopup.leavingLumin'),
      message: <WarningHyperlinkContent url={url} />,
      cancelButtonTitle: t('common.cancel'),
      confirmButtonTitle: t('common.proceed'),
      onCancel: () => store.dispatch(actions.closeModal()),
      onConfirm: () => {
        window.open(url, '_blank', 'noopener,noreferrer');
      },
      isFullWidthButton: true,
    })
  );
}
