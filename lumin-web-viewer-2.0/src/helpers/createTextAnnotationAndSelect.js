import actions from 'actions';
import core from 'core';
import selectors from 'selectors';
import { store } from 'store';

import { getAnnotationFromXfdf, makeXfdfString } from 'luminComponents/NoteLumin/helpers';

import { commandHandler } from 'HOC/OfflineStorageHOC';

import getToolStyles from 'helpers/getToolStyles';

import { getHighlightCommentStickyId, isHighlightComment } from 'features/Comments/utils/commons';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT, CUSTOM_DATA_TEXT_TOOL } from 'constants/customDataConstant';
import { ANNOTATION_ACTION, AnnotationSubjectMapping } from 'constants/documentConstants';
import { mapAnnotationToToolName } from 'constants/map';

const createAnnotation = (annotationConstructor, pageNumber, quads) => {
  // eslint-disable-next-line new-cap
  const annotation = new annotationConstructor();

  annotation.PageNumber = pageNumber;
  annotation.Quads = quads[pageNumber];
  annotation.Author = core.getCurrentUser();
  return annotation;
};

const setAnnotationColor = (annotation) => {
  const toolName = mapAnnotationToToolName(annotation);

  if (toolName) {
    const { StrokeColor, Opacity } = getToolStyles(toolName);
    annotation.StrokeColor = StrokeColor;
    annotation.Opacity = Opacity;
  }
};

const setRedactionStyle = (annotation) => {
  const {
    AnnotationCreateRedaction: { defaults: style = {} },
  } = core.getToolModeMap();

  if (style) {
    if (style.StrokeColor) {
      const color = style.StrokeColor;
      annotation.StrokeColor = new window.Core.Annotations.Color(color.R, color.G, color.B, color.A);
    }
    if (style.StrokeThickness) {
      annotation.StrokeThickness = style.StrokeThickness;
    }
    if (style.FillColor) {
      const fillColor = style.FillColor;
      annotation.FillColor = new window.Core.Annotations.Color(fillColor.R, fillColor.G, fillColor.B, fillColor.A);
    }
  }
};

const createTextAnnotation = (dispatch, annotationConstructor, isComment) => {
  const annotations = [];
  const quads = core.getSelectedTextQuads();

  Object.keys(quads).forEach((pageNumber) => {
    pageNumber = parseInt(pageNumber, 10);
    const annotation = createAnnotation(annotationConstructor, pageNumber, quads);

    if (
      window.Core.Tools.TextAnnotationCreateTool.AUTO_SET_TEXT &&
      !(annotation instanceof window.Core.Annotations.RedactionAnnotation)
    ) {
      annotation.setContents(core.getSelectedText(pageNumber));
    }
    annotation.setCustomData(CUSTOM_DATA_TEXT_TOOL.CONTENT.key, core.getSelectedText(pageNumber));
    if (annotation instanceof window.Core.Annotations.RedactionAnnotation) {
      setRedactionStyle(annotation);
    }

    if (annotation instanceof window.Core.Annotations.TextHighlightAnnotation && isComment) {
      annotation.setCustomData(
        CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.key,
        CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_HIGHLIGHT_COMMENT.truthyValue
      );
      annotation.setCustomData(
        CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_HAS_CONTENT.key,
        CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_HAS_CONTENT.noValue
      );
      annotation.NoResize = true;
      annotation.NoMove = true;
      const comment = new window.Core.Annotations.StickyAnnotation();
      comment.X = annotation.X + annotation.Width / 2;
      comment.Y = annotation.Y + annotation.Height / 2 - comment.Height / 2;
      comment.PageNumber = annotation.PageNumber;
      comment.setCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.HIGHLIGHT_TEXT.key, core.getSelectedText());
      comment.Hidden = true;
      comment.NoMove = true;
      comment.NoZoom = true;
      comment.Author = core.getCurrentUser();

      annotation.setCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.STICKY_ID.key, comment.Id);
      annotations.push(comment);

      dispatch(actions.triggerNoteEditing());
      dispatch(actions.closeElements(['leftPanel', 'searchPanel', 'searchOverlay']));
      if (core.getDisplayMode() !== 'Continuous') {
        core.setDisplayMode('Continuous');
        core.jumpToAnnotation(annotation);
      }
    }

    setAnnotationColor(annotation);

    annotations.push(annotation);
  });

  return annotations;
};

export default async (dispatch, annotationConstructor, isComment = false) => {
  const state = store.getState();
  const annotations = createTextAnnotation(dispatch, annotationConstructor, isComment);
  const isOffline = selectors.isOffline(state);
  const currentUser = selectors.getCurrentUser(state);
  const currentDocument = selectors.getCurrentDocument(state);
  const annotManager = core.getAnnotationManager();
  const highlightAnno = annotations?.[1];

  if(highlightAnno && annotationConstructor === window.Core.Annotations.TextHighlightAnnotation && currentUser) {
    const xmlSerializer = new XMLSerializer();
    const [_, highlightAnnoDom] = await getAnnotationFromXfdf(annotations);
    const highlightAnnoString = xmlSerializer.serializeToString(highlightAnnoDom);
    const xfdf = makeXfdfString(highlightAnnoString);
    const unqAnnot =
      annotManager
        .getAnnotationsList()
        .find((annot) => annot.PageNumber === annotations[1].PageNumber && annot.Subject === 'LUnique') || {};

    if (isOffline) {
      const isHighlightCommentAnnot = isHighlightComment({ annotation: highlightAnno });
      const stickyLinkId = getHighlightCommentStickyId({ annotation: highlightAnno });
      commandHandler.insertAnnotation(currentDocument._id, {
        annots: [{
          annotationAuthor: highlightAnno.Author,
          annotationType: AnnotationSubjectMapping.highlight,
          annotationAction: ANNOTATION_ACTION.ADD,
          annotationId: highlightAnno.Id,
          userId: currentUser._id,
          email: currentUser.email,
          belongsTo: unqAnnot.Id || '',
          xfdf,
          annotation: highlightAnno,
          ...(isHighlightCommentAnnot && stickyLinkId && { stickyLinkId }),
        }],
        manager: annotManager
      });
    } else {
      await commandHandler.insertTempAction(currentDocument._id, [
        {
          type: 'annotation',
          xfdf,
        },
      ]);
    }
  }

  core.clearSelection();
  if (annotationConstructor === window.Core.Annotations.RedactionAnnotation) {
    core.setToolMode('AnnotationCreateRedaction');
  }
  core.addAnnotations(annotations, {});
  core.selectAnnotations(annotations);
  dispatch(actions.closeElement('textPopup'));
};
