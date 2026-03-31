import { useCallback, useEffect } from 'react';
import { useMatch, useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';

import { useCleanup } from 'hooks/useCleanup';
import { useIsSystemFile } from 'hooks/useIsSystemFile';

import { useIsTempEditMode } from 'features/OpenForm/hooks/useIsTempEditMode';

import { ROUTE_MATCH } from 'constants/Routers';

import { useCurrentAnnotationsStore } from './useCurrentAnnotationsStore';

export const useFetchingAnnotationsStore = () => {
  const { documentId } = useParams();
  const isGuestPath = Boolean(useMatch({ path: ROUTE_MATCH.GUEST_VIEW }));
  const { isSystemFile } = useIsSystemFile();
  const { isTempEditMode } = useIsTempEditMode();

  const {
    storeDocumentId,
    annotations,
    isLoading,
    error,
    isFromStream,
    fetchAnnotations,
    setAnnotations: setStoreAnnotations,
    clearCurrentDocument,
    reset,
  } = useCurrentAnnotationsStore(
    useShallow((state) => ({
      storeDocumentId: state.documentId,
      annotations: state.annotations,
      isLoading: state.isLoading,
      error: state.error,
      isFromStream: state.isFromStream,
      fetchAnnotations: state.fetchAnnotations,
      setAnnotations: state.setAnnotations,
      clearCurrentDocument: state.clearCurrentDocument,
      reset: state.reset,
    }))
  );

  const canFetchAnnotations = Boolean(documentId && !isSystemFile && !isGuestPath && !isTempEditMode);

  const shouldFetchAnnotations = canFetchAnnotations && storeDocumentId !== documentId;

  const isCurrentDocument = storeDocumentId === documentId;

  useEffect(() => {
    if (shouldFetchAnnotations) {
      fetchAnnotations(documentId);
    }
  }, [shouldFetchAnnotations, fetchAnnotations, documentId]);

  useCleanup(() => {
    if (isGuestPath) {
      clearCurrentDocument();
    }
  }, [documentId, isGuestPath, clearCurrentDocument]);

  const refetch = useCallback(() => {
    if (!documentId) {
      return Promise.resolve();
    }

    reset();
    return fetchAnnotations(documentId);
  }, [documentId, fetchAnnotations, reset]);

  const getDataForCurrentDocument = useCallback(() => {
    if (!isCurrentDocument) {
      return {
        annotations: [],
        isLoading: false,
        error: null,
        isFromStream: null,
      };
    }

    return {
      annotations,
      isLoading,
      error,
      isFromStream,
    };
  }, [isCurrentDocument, annotations, isLoading, error, isFromStream]);

  return {
    ...getDataForCurrentDocument(),
    setAnnotations: setStoreAnnotations,
    refetch,
  };
};
