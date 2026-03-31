import { useMemo, useRef, useState } from 'react';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import revisionServiceFactory from 'features/DocumentRevision/utils/serviceFactory';

import { useGetEnhancedFeaturesPlan } from './useEnhancedFeaturesPlan';
import { useGetRevisionList } from './useGetRevisionList';

export const useDocumentVersioningHandler = () => {
  const currentAnnotsRef = useRef<string>('');
  const currentVersionIdRef = useRef<string | undefined>();
  const [activeVersion, setActiveVersion] = useState<string>();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const revisionService = useMemo(() => revisionServiceFactory.from(currentDocument.service), [currentDocument]);
  const shouldShowRevisionPlans = !currentDocument.isShared;
  const canUseEnhancedFeatures = useGetEnhancedFeaturesPlan();
  const passwordToRestoreRef = useRef<string | undefined>();

  const { isFetchingList, documentRevisions, refetchVersions } = useGetRevisionList({
    canUseEnhancedFeatures,
    currentVersionIdRef,
    setActiveVersion,
    revisionService,
  });

  return {
    activeVersion,
    setActiveVersion,
    revisionService,
    currentAnnotsRef,
    currentVersionIdRef,
    shouldShowRevisionPlans,
    documentRevisions,
    canUseEnhancedFeatures,
    isFetchingList,
    refetchVersions,
    passwordToRestoreRef,
  };
};
