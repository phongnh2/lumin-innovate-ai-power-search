import isNull from 'lodash/isNull';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { connect } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';
import { useShallow } from 'zustand/react/shallow';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import Loading from 'luminComponents/Loading';

import { useCleanup } from 'hooks';

import getAnnotationCenterPoint from 'helpers/getAnnotationCenterPoint';
import setToolStyles from 'helpers/setToolStyles';

import { signature } from 'utils';

import { useAutoDetectionStore } from 'features/FormFieldDetection/hooks/useAutoDetectionStore';
import { useIsTempEditMode } from 'features/OpenForm';
import { useFetchSignatures, useSignaturesAction } from 'features/Signature';

import { CUSTOM_DATA_AUTO_DETECTION, CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import { ANNOTATION_STYLE } from 'constants/documentConstants';
import { LocalStorageKey } from 'constants/localStorageKey';
import { DEBOUNCED_SIGN_SIGNATURE_TIME, MAXIMUM_NUMBER_SIGNATURE } from 'constants/lumin-common';
import { DEFAULT_SIGNATURE_MAXIMUM_DIMENSION, DROP_ACTIONS } from 'constants/signatureConstant';
import { TOOLS_NAME } from 'constants/toolsName';

import SignatureDnDList from './SignatureDnDList';
import CreateSignatureModal from '../../CreateSignatureModal/OpenCreateSignatureModalBtn';
import { SignatureListPopoverContentContext } from '../SignatureListPopoverContentContext';

import * as Styled from './YourSignatures.styled';

const SignatureList = ({
  isOffline,
  userSignatures,
  currentDocument,
  currentUser,
  isPlacingMultipleSignatures,
  setPlacingMultipleSignatures,
  setSelectedSignature,
  signatureWidgetSelected,
  signatureStatus,
}) => {
  const dragSignatureIndex = useRef(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const { deleteOneMutation, reorder } = useSignaturesAction();
  const { closePopper } = useContext(SignatureListPopoverContentContext);
  const { loading, hasNext, loadMore, fetchSignaturesAfterMount } = useFetchSignatures();
  const { isTempEditMode } = useIsTempEditMode();
  const [scrollRef] = useInfiniteScroll({
    loading,
    hasNextPage: hasNext,
    onLoadMore: loadMore,
    disabled: isOffline,
    rootMargin: '0px 0px 60px 0px',
  });
  const { autoDetectAnnotationId, removeAutoDetectAnnotationId } = useAutoDetectionStore(
    useShallow((state) => ({
      autoDetectAnnotationId: state.autoDetectAnnotationId,
      removeAutoDetectAnnotationId: state.removeAutoDetectAnnotationId,
    }))
  );
  const maximumNumberSignature =
    currentDocument.premiumToolsInfo?.maximumNumberSignature || MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN;

  const resetSelectedPosition = () => {
    dragSignatureIndex.current = null;
  };

  const handleClickCheckbox = useCallback(() => {
    localStorage.setItem(LocalStorageKey.IS_PLACING_MULTIPLE_SIGNATURES, !isPlacingMultipleSignatures);
    setPlacingMultipleSignatures(!isPlacingMultipleSignatures);
  }, [isPlacingMultipleSignatures, setPlacingMultipleSignatures]);

  const findSignatureByKey = (key) => userSignatures.find((signature) => signature.index === key);

  const onMouseLeaveSignatureOverlay = useCallback(async () => {
    const currentSignature = findSignatureByKey(dragSignatureIndex.current);
    if (
      !currentSignature ||
      !currentSignature.imgSrc ||
      (!isOffline && !currentSignature.remoteId) ||
      !dragSignatureIndex.current
    ) {
      return;
    }
    if (isPlacingMultipleSignatures) {
      handleClickCheckbox();
    }
    const { imgSrc } = currentSignature;
    closePopper();
    setSelectedSignature(imgSrc);
    core.setToolMode(TOOLS_NAME.SIGNATURE);
    const annotationCreateSignatureTool = core.getTool(TOOLS_NAME.SIGNATURE);
    setToolStyles(TOOLS_NAME.SIGNATURE, ANNOTATION_STYLE.OPACITY, 1);
    await annotationCreateSignatureTool.setSignature(imgSrc);
    annotationCreateSignatureTool.showPreview();
  }, [closePopper, handleClickCheckbox, isOffline, isPlacingMultipleSignatures, setSelectedSignature, userSignatures]);

  const onDragEnd = async ({ destination, source, reason }) => {
    // dragged out side or drop in unacceptable zone
    if (isNull(destination)) {
      if (reason === DROP_ACTIONS.CANCEL) {
        onMouseLeaveSignatureOverlay();
        return;
      }
      if (reason === DROP_ACTIONS.DROP) {
        resetSelectedPosition();
        return;
      }
    }
    resetSelectedPosition();
    const fromPosition = source.index;
    const toPosition = destination.index;
    reorder({ startIndex: fromPosition, endIndex: toPosition });
  };

  useEffect(() => {
    const ele = document.querySelector('.signature-popover-content');

    ele.addEventListener('mouseleave', onMouseLeaveSignatureOverlay);
    return () => {
      ele.removeEventListener('mouseleave', onMouseLeaveSignatureOverlay);
    };
  }, [onMouseLeaveSignatureOverlay]);

  const setActiveSignature = async (key) => {
    if (!key) {
      return;
    }
    const currentSignature = userSignatures.find((sig) => sig.index === key);
    if (!currentSignature || !currentSignature.imgSrc || (!isOffline && !currentSignature.remoteId)) {
      return;
    }

    const { imgSrc } = currentSignature;
    setSelectedSignature(imgSrc);

    core.setToolMode(TOOLS_NAME.SIGNATURE);
    const annotationCreateSignatureTool = core.getTool(TOOLS_NAME.SIGNATURE);
    setToolStyles(TOOLS_NAME.SIGNATURE, ANNOTATION_STYLE.OPACITY, 1);
    await annotationCreateSignatureTool.setSignature(imgSrc);

    if (signatureWidgetSelected) {
      const associatedSignature = annotationCreateSignatureTool.getFullSignatureAnnotation();
      associatedSignature.setCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key, signatureWidgetSelected.Id);
      associatedSignature.setCustomData(
        CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.alternativeKey,
        signatureWidgetSelected.fieldName
      );
      associatedSignature.setCustomData(
        CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.key,
        signatureWidgetSelected.fieldName
      );
      annotationCreateSignatureTool.setDefaultSignatureOptions({
        maximumDimensionSize: Math.min(
          Math.min(annotationCreateSignatureTool.widget.Width, annotationCreateSignatureTool.widget.Height),
          DEFAULT_SIGNATURE_MAXIMUM_DIMENSION
        ),
      });
      annotationCreateSignatureTool.location = getAnnotationCenterPoint(signatureWidgetSelected);
    }

    if (autoDetectAnnotationId) {
      const associatedSignature = annotationCreateSignatureTool.getFullSignatureAnnotation();
      associatedSignature.setCustomData(
        CUSTOM_DATA_AUTO_DETECTION.AUTO_DETECTION_ANNOTATION_ID.key,
        autoDetectAnnotationId
      );
      removeAutoDetectAnnotationId();
    }

    if (annotationCreateSignatureTool.hasLocation()) {
      await annotationCreateSignatureTool.addSignature();
      annotationCreateSignatureTool.setDefaultSignatureOptions({
        maximumDimensionSize: DEFAULT_SIGNATURE_MAXIMUM_DIMENSION,
      });
    } else {
      await annotationCreateSignatureTool.showPreview();
    }
    closePopper();
  };

  const debouncedSetActiveSignature = useDebouncedCallback((signatureIndex) => {
    setActiveSignature(signatureIndex);
  }, DEBOUNCED_SIGN_SIGNATURE_TIME);

  useCleanup(() => debouncedSetActiveSignature.cancel(), []);

  useEffect(() => {
    fetchSignaturesAfterMount();
  }, []);

  const onMouseUpItem = () => {
    if (!signatureWidgetSelected) {
      dragSignatureIndex.current = null;
    }
  };

  const onMouseDownItem = (signatureItem) => {
    if (!signatureWidgetSelected) {
      dragSignatureIndex.current = signatureItem.index;
    }
  };

  const onDeleteSignature = async ({ e, remoteId, signatureIndex }) => {
    e.stopPropagation();
    if (remoteId) {
      setDeletingIndex(signatureIndex);
      deleteOneMutation.trigger(remoteId);
    }
  };

  const renderFetchingSkeleton = () => {
    const { hasNext } = signatureStatus;
    if (hasNext || loading) {
      return (
        <div style={{ padding: '16px 0' }} ref={scrollRef}>
          <Loading normal />
        </div>
      );
    }
    return null;
  };

  const renderListSignature = () => (
    <Styled.ListWrapper>
      <SignatureDnDList
        onDragEnd={onDragEnd}
        sortedSignatures={userSignatures}
        deletingIndex={deletingIndex}
        maximumNumberSignature={maximumNumberSignature}
        onClick={debouncedSetActiveSignature}
        onMouseUp={onMouseUpItem}
        onMouseDown={onMouseDownItem}
        onDelete={onDeleteSignature}
        isOffline={isOffline}
        loader={renderFetchingSkeleton()}
      />
    </Styled.ListWrapper>
  );

  const renderCreateSignatureBtn = () => {
    const shouldNotShow = signature.getNumberOfSignatures(currentUser) >= maximumNumberSignature;

    if (shouldNotShow) {
      return null;
    }
    return <CreateSignatureModal />;
  };

  if (!currentDocument) {
    return null;
  }

  return (
    <Styled.SignatureListWrapper mah={400} data-cy="signature_list_wrapper">
      <div style={{ padding: 'var(--kiwi-spacing-1-5)' }}>
        {renderCreateSignatureBtn()}
        {!isTempEditMode && renderListSignature()}
      </div>
    </Styled.SignatureListWrapper>
  );
};

SignatureList.propTypes = {
  currentUser: PropTypes.object,
  currentDocument: PropTypes.object.isRequired,
  userSignatures: PropTypes.array.isRequired,
  isOffline: PropTypes.bool.isRequired,
  isPlacingMultipleSignatures: PropTypes.bool.isRequired,
  setPlacingMultipleSignatures: PropTypes.func.isRequired,
  setSelectedSignature: PropTypes.func.isRequired,
  signatureWidgetSelected: PropTypes.object,
  signatureStatus: PropTypes.object.isRequired,
};

SignatureList.defaultProps = {
  signatureWidgetSelected: null,
  currentUser: null,
};

const mapStateToProps = (state) => ({
  isOffline: selectors.isOffline(state),
  userSignatures: selectors.getUserSignatures(state),
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
  isPlacingMultipleSignatures: selectors.isPlacingMultipleSignatures(state),
  signatureWidgetSelected: selectors.signatureWidgetSelected(state),
  signatureStatus: selectors.getUserSignatureStatus(state),
});

const mapDispatchToProps = (dispatch) => ({
  setPlacingMultipleSignatures: (isPlacingMultipleSignatures) =>
    dispatch(actions.setPlacingMultipleSignatures(isPlacingMultipleSignatures)),
  setSelectedSignature: (src) => dispatch(actions.setSelectedSignature(src)),
  setCurrentUser: (currentUser) => dispatch(actions.setCurrentUser(currentUser)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SignatureList);
