import debounce from 'lodash/debounce';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLatest } from 'react-use';

import core from 'core';

import { useTranslation } from 'hooks';

import DetectedFieldPlaceholder from 'helpers/CustomAnnotation/DetectedFieldPlaceholder';
import { isMobileDevice } from 'helpers/device';
import { getCommentPreviewPopupPositionBaseOn } from 'helpers/getPopupPosition';

import { isComment } from 'features/Comments/utils';
import { getUserInfoFromCommentAnnot } from 'features/Comments/utils/getUserInfoFromCommentAnnot';

import { DataElements } from 'constants/dataElement';
import { ANNOTATION_ACTION, COMMENT_PANEL_LAYOUT_STATE, PDF_ACTION_TYPE } from 'constants/documentConstants';
import { HTTPS_PROTOCOL, HTTP_PROTOCOL } from 'constants/lumin-common';
import { TOOLS_NAME } from 'constants/toolsName';

import './AnnotationContentOverlay.scss';
import { OVERLAY_DEBOUNCE, GAP, MAX_CHARACTERS } from './constants';
import { PreviewComment } from './PreviewComment';

import * as Styled from './AnnotationContentOverlay.styled';

const shouldShowAuthor = (annotation) =>
  annotation instanceof window.Core.Annotations.TextUnderlineAnnotation ||
  annotation instanceof window.Core.Annotations.TextHighlightAnnotation ||
  annotation instanceof window.Core.Annotations.TextStrikeoutAnnotation ||
  annotation instanceof window.Core.Annotations.TextSquigglyAnnotation ||
  annotation instanceof window.Core.Annotations.FreeTextAnnotation ||
  annotation instanceof window.Core.Annotations.FreeHandAnnotation ||
  annotation instanceof window.Core.Annotations.RectangleAnnotation ||
  annotation instanceof window.Core.Annotations.EllipseAnnotation ||
  annotation instanceof window.Core.Annotations.LineAnnotation ||
  annotation instanceof window.Core.Annotations.PolylineAnnotation ||
  annotation instanceof window.Core.Annotations.PolygonAnnotation ||
  annotation instanceof window.Core.Annotations.CustomAnnotation ||
  annotation instanceof window.Core.Annotations.StampAnnotation ||
  annotation instanceof window.Core.Annotations.StickyAnnotation;

const getLink = ({ annotation, t }) => {
  const action = annotation.getActions()[PDF_ACTION_TYPE.MOUSE_RELEASED];
  if (!action) {
    return '';
  }
  const urlLinkAnnotation = action[0].uri || '';
  const destLinkAnnotation = action[0].dest;
  if (urlLinkAnnotation.startsWith(HTTP_PROTOCOL) || urlLinkAnnotation.startsWith(HTTPS_PROTOCOL)) {
    return urlLinkAnnotation;
  }
  if (destLinkAnnotation) {
    const pageToNavigate = destLinkAnnotation.page || t('viewer.annotationContentOverlay.noLongerExists');
    return t('viewer.annotationContentOverlay.pageToNavigate', { pageToNavigate });
  }
  return `${HTTPS_PROTOCOL}${urlLinkAnnotation}`;
};

const getContent = ({ annotation, t, currentUser }) => {
  if (!annotation) {
    return null;
  }
  const isStamp = annotation instanceof window.Core.Annotations.StampAnnotation;

  if (isStamp && annotation.isConvertingSignedUrl) {
    return t('viewer.leftPanelEditMode.uploading');
  }

  if (shouldShowAuthor(annotation)) {
    const { name } = getUserInfoFromCommentAnnot({
      annotation,
      currentUser,
    });
    return name;
  }
  const link = getLink({ annotation, t });

  if (!link) {
    return null;
  }

  return getLink({ annotation, t });
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const AnnotationContentOverlay = ({
  currentUser,
  isDisabled,
  isUsingCustomHandler,
  openOverlay,
  closeOverlay,
  commentLayout,
  isInReadAloudMode,
  isInPresenterMode,
}) => {
  const currentUserRef = useLatest(currentUser);
  const [annotation, setAnnotation] = useState(null);
  const [clientXY, setClientXY] = useState({ clientX: 0, clientY: 0 });
  const [overlayStyles, setOverlayStyles] = useState({
    left: 0,
    top: 0,
    visibility: 'hidden',
    opacity: 0,
  });
  const { t } = useTranslation();
  const overlayRef = useRef(null);
  const contents = getContent({ annotation, t, currentUser });
  const selectedAnnotationRef = useRef(annotation);
  const shouldDisplayPreviewComment =
    commentLayout === COMMENT_PANEL_LAYOUT_STATE.ON_DOCUMENT && annotation && isComment({ annotation });

  const fitWindowSize = ({ clientX, clientY }) => {
    const overlayBounds = overlayRef.current.getBoundingClientRect();
    const horizontalGap = GAP * 2;
    const verticalGap = GAP;

    let leftPosition = clientX - horizontalGap;
    let topPosition = clientY + verticalGap;

    if (leftPosition + overlayBounds.width > window.innerWidth) {
      leftPosition = clientX - overlayBounds.width;
    }

    if (topPosition + overlayBounds.height > window.innerHeight) {
      topPosition = clientY - overlayBounds.height - verticalGap;
    }

    return { left: leftPosition, top: topPosition };
  };

  const onHoverOverAnnotation = useCallback(
    debounce(() => {
      if (overlayRef.current && annotation) {
        const { left, top } = shouldDisplayPreviewComment
          ? getCommentPreviewPopupPositionBaseOn(annotation, overlayRef)
          : fitWindowSize(clientXY);
        if (!isDisabled && !isMobileDevice && annotation && contents && left !== 0 && top !== 0) {
          setOverlayStyles({ left, top, visibility: 'visible', opacity: 1 });
        } else {
          setOverlayStyles({ left, top, visibility: 'hidden', opacity: 0 });
        }
        openOverlay();
      }
    }, OVERLAY_DEBOUNCE),
    [commentLayout, annotation, shouldDisplayPreviewComment, clientXY, isDisabled, isMobileDevice, contents]
  );

  useEffect(() => {
    selectedAnnotationRef.current = annotation;
    onHoverOverAnnotation();
  }, [annotation, shouldDisplayPreviewComment]);

  const initValues = () => {
    onHoverOverAnnotation.cancel();
    setAnnotation(null);
    setOverlayStyles({ left: 0, top: 0, visibility: 'hidden', opacity: 0 });
    closeOverlay();
  };

  useEffect(() => {
    const onMouseHover = (element) => {
      const isDisplayPreviewAnnotation = [
        TOOLS_NAME.SIGNATURE,
        TOOLS_NAME.CROSS_STAMP,
        TOOLS_NAME.DOT_STAMP,
        TOOLS_NAME.FREETEXT,
        TOOLS_NAME.RUBBER_STAMP,
        TOOLS_NAME.TICK_STAMP,
      ].includes(core.getToolMode().name);
      if (isDisplayPreviewAnnotation) {
        return;
      }
      const viewElement = core.getViewerElement();
      let annotationByMouse = core.getAnnotationManager().getAnnotationByMouseEvent(element);
      if (annotationByMouse && viewElement.contains(element.target)) {
        if (annotationByMouse instanceof DetectedFieldPlaceholder) {
          return;
        }

        const isLoggedIn = !!currentUserRef.current?._id;
        const groupedAnnotations = core.getAnnotationManager().getGroupAnnotations(annotationByMouse);
        const isLinkGroupAnnotations = groupedAnnotations.some(
          (annotation) => annotation instanceof window.Core.Annotations.Link
        );
        if (isLinkGroupAnnotations) {
          annotationByMouse = groupedAnnotations.find(
            (annotation) => annotation instanceof window.Core.Annotations.Link
          );
        } else {
          const ungroupedAnnotations = groupedAnnotations.filter((annotation) => !annotation.isGrouped());
          annotationByMouse = ungroupedAnnotations.length > 0 ? ungroupedAnnotations[0] : annotationByMouse;
        }

        const isSelectedAnnot = core
          .getSelectedAnnotations()
          .find((selectedAnnotation) => selectedAnnotation.Id === annotationByMouse.Id);

        const isValidAnnotation = shouldShowAuthor(annotationByMouse) && !isSelectedAnnot;
        const shouldShowContent =
          isUsingCustomHandler ||
          annotationByMouse instanceof window.Core.Annotations.Link ||
          (isValidAnnotation && isLoggedIn);

        if (shouldShowContent) {
          setClientXY({ clientX: element.clientX, clientY: element.clientY });
          setAnnotation(annotationByMouse);
        }
      } else if (!shouldDisplayPreviewComment) {
        initValues();
      }
    };

    const shouldHideCurrentAnnot = (selectedAnnotations = []) => {
      if (!selectedAnnotations.length || !selectedAnnotationRef.current) {
        return false;
      }
      return selectedAnnotations.some((selectedAnnots) => selectedAnnots.Id === selectedAnnotationRef.current.Id);
    };

    const onAnnotationChanged = (annotations, action) => {
      if (
        annotations.length > 0 &&
        (annotations[0] instanceof window.Core.Annotations.Link || shouldShowAuthor(annotations[0])) &&
        action === ANNOTATION_ACTION.DELETE
      ) {
        core.getAnnotationManager().ungroupAnnotations([annotations[0]]);
      }
    };

    const onAnnotationSelected = (annotations) => {
      if (!selectedAnnotationRef.current || !annotations.length) {
        return;
      }
      if (shouldHideCurrentAnnot(core.getSelectedAnnotations())) {
        setAnnotation(null);
      }
    };
    core.docViewer.getScrollViewElement().addEventListener('scroll', initValues);
    core.addEventListener('annotationSelected', onAnnotationSelected);
    core.addEventListener('annotationChanged', onAnnotationChanged);
    core.addEventListener('mouseMove', onMouseHover);
    return () => {
      core.removeEventListener('mouseMove', onMouseHover);
      core.removeEventListener('annotationChanged', onAnnotationChanged);
      core.removeEventListener('annotationSelected', onAnnotationSelected);
      core.docViewer.getScrollViewElement().removeEventListener('scroll', initValues);
      onHoverOverAnnotation.cancel();
    };
  }, [isUsingCustomHandler, shouldDisplayPreviewComment]);

  const renderContent = () => {
    if (isString(contents) && contents.length > MAX_CHARACTERS) {
      return `${contents.slice(0, MAX_CHARACTERS)}...`;
    }
    return contents;
  };

  if ((!annotation && !shouldDisplayPreviewComment) || isInReadAloudMode || isInPresenterMode) {
    return null;
  }

  const renderContents = () => {
    if (shouldDisplayPreviewComment) {
      return <PreviewComment annotation={annotation} closeOverlay={initValues} />;
    }

    return (
      <Styled.AnnotationContentOverlay data-element={DataElements.ANNOTATION_CONTENT_OVERLAY}>
        <Styled.Contents>{renderContent()}</Styled.Contents>
      </Styled.AnnotationContentOverlay>
    );
  };

  return (
    <div className="AnnotationContainer" style={overlayStyles} ref={overlayRef}>
      {renderContents()}
    </div>
  );
};

AnnotationContentOverlay.propTypes = {
  currentUser: PropTypes.object,
  isDisabled: PropTypes.bool,
  isUsingCustomHandler: PropTypes.bool,
  openOverlay: PropTypes.func,
  closeOverlay: PropTypes.func,
  commentLayout: PropTypes.oneOf(Object.values(COMMENT_PANEL_LAYOUT_STATE)).isRequired,
  isInReadAloudMode: PropTypes.bool,
  isInPresenterMode: PropTypes.bool,
};

AnnotationContentOverlay.defaultProps = {
  currentUser: {},
  isDisabled: false,
  isUsingCustomHandler: false,
  openOverlay: () => {},
  closeOverlay: () => {},
  isInReadAloudMode: false,
  isInPresenterMode: false,
};

export default AnnotationContentOverlay;
