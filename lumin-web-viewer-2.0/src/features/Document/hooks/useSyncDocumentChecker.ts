import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useInRedactionMode } from 'hooks/useInRedactionMode';
import { useShallowSelector } from 'hooks/useShallowSelector';

import { formBuilderSelectors } from 'features/DocumentFormBuild/slices';
import { readAloudSelectors } from 'features/ReadAloud/slices';

export const useSyncDocumentChecker = () => {
  const isInContentEditMode = useShallowSelector(selectors.isInContentEditMode);
  const isInFormBuilderMode = useSelector(formBuilderSelectors.isInFormBuildMode);
  const { isInRedactionMode } = useInRedactionMode();
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);

  const canSync = !isInRedactionMode && !isInContentEditMode && !isInReadAloudMode && !isInFormBuilderMode;

  const canSyncOnAnnotationChange = useCallback((imported: boolean) => !imported && canSync, [canSync]);

  return {
    canSyncFormFieldChange: !isInFormBuilderMode && !isInRedactionMode && !isInReadAloudMode && !isInContentEditMode,
    canSync,
    canSyncOnAnnotationChange,
  };
};
