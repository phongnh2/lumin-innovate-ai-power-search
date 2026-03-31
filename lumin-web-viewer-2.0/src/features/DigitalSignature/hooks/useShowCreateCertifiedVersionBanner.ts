import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

import core from 'core';
import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { useTemplateViewerMatch } from 'features/Document/hooks/useTemplateViewerMatch';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { CUSTOM_EVENT } from 'constants/customEvent';
import { ANNOTATION_ACTION, AnnotationSubjectMapping } from 'constants/documentConstants';

import { MAX_FILE_SIZE_MB } from '../constants';
import { digitalSignatureActions, digitalSignatureSelectors } from '../slices';

const useShowCreateCertifiedVersionBanner = () => {
  const dispatch = useDispatch();
  const turnOnDebounceRef = useRef(false);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const isAnnotationLoaded = useSelector(selectors.getAnnotationsLoaded);
  const isOffline = useSelector(selectors.isOffline);
  const isProcessingDigitalSignature = useSelector(digitalSignatureSelectors.isDigitalSignatureProcessing);
  const { isTemplateViewer } = useTemplateViewerMatch();
  const debounceShowCreateCertifiedVersionBanner = useDebouncedCallback(
    () => {
      turnOnDebounceRef.current = false;
      dispatch(digitalSignatureActions.setShouldShowBanner(true));
    },
    10000,
    { trailing: true }
  );

  const isValidDocument =
    currentDocument?.size <= MAX_FILE_SIZE_MB * 1024 * 1024 && !currentDocument?.isSystemFile && !isTemplateViewer;

  const shouldAddEventListeners =
    isValidDocument && !isOffline && isAnnotationLoaded && !!currentUser && !isProcessingDigitalSignature;

  const showCreateCertifiedVersionBanner = () => {
    if (turnOnDebounceRef.current) {
      debounceShowCreateCertifiedVersionBanner();
    }
  };

  useEffect(() => {
    const onAnnotationChanged = (
      annotations: Core.Annotations.Annotation[],
      action: string,
      source: Record<string, unknown>
    ) => {
      if (annotations.length === 0) {
        return;
      }
      showCreateCertifiedVersionBanner();
      const firstAnnotation = annotations[0];
      const isSignatureAnnotation =
        firstAnnotation instanceof window.Core.Annotations.StampAnnotation &&
        firstAnnotation.Subject === AnnotationSubjectMapping.signature;
      if (isSignatureAnnotation && action === ANNOTATION_ACTION.ADD && !source.imported) {
        const widgetId = firstAnnotation.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
        if (widgetId) {
          const signatureWidgets = core
            .getAnnotationsList()
            .filter((annot) => annot instanceof window.Core.Annotations.SignatureWidgetAnnotation);
          const isAllSignatureWidgetSigned = signatureWidgets.every(
            (annot) => !!annot?.getAssociatedSignatureAnnotation()?.Id
          );
          if (isAllSignatureWidgetSigned) {
            turnOnDebounceRef.current = true;
            debounceShowCreateCertifiedVersionBanner();
          }
        } else {
          turnOnDebounceRef.current = true;
          debounceShowCreateCertifiedVersionBanner();
        }
      }
    };
    if (shouldAddEventListeners) {
      core.addEventListener('annotationChanged', onAnnotationChanged);
      core.addEventListener('fieldChanged', showCreateCertifiedVersionBanner);
      window.addEventListener(CUSTOM_EVENT.MANIPULATION_CHANGED, showCreateCertifiedVersionBanner);
    }

    return () => {
      if (shouldAddEventListeners) {
        core.removeEventListener('annotationChanged', onAnnotationChanged);
        core.removeEventListener('fieldChanged', showCreateCertifiedVersionBanner);
        window.removeEventListener(CUSTOM_EVENT.MANIPULATION_CHANGED, showCreateCertifiedVersionBanner);
        debounceShowCreateCertifiedVersionBanner.cancel();
      }
    };
  }, [shouldAddEventListeners]);
};

export default useShowCreateCertifiedVersionBanner;
