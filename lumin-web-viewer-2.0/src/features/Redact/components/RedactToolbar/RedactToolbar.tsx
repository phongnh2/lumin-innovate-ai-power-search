import { Button, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useRef, useState } from 'react';

import SecondaryToolbar from '@new-ui/components/SecondaryToolbar';
import { ToolName } from 'core/type';

import core from 'core';

import useAutoSync from 'hooks/useAutoSync';
import { useTranslation } from 'hooks/useTranslation';

import { updateUserMetadataFromFLPSearchParams } from 'utils/updateUserMetadata';

import { PdfAction } from 'features/EnableToolFromQueryParams/constants';
import { ExploredFeatureKeys } from 'features/EnableToolFromQueryParams/constants/exploredFeatureKeys';
import useApplyRedaction from 'features/Redact/hooks/useApplyRedaction';

import { AUTO_SYNC_CHANGE_TYPE } from 'constants/autoSyncConstant';
import defaultTool from 'constants/defaultTool';

const RedactToolbar: React.FC = () => {
  const [disabled, setDisable] = useState(false);
  const applyRedaction = useApplyRedaction();
  const shouldExitRedact = useRef(false);
  const { t } = useTranslation();

  const onSuccess = ({ action }: { action: string }) => {
    if (action.includes(AUTO_SYNC_CHANGE_TYPE.REDACTION) && shouldExitRedact.current) {
      core.setToolMode(defaultTool as ToolName);
      shouldExitRedact.current = false;
    }
  };

  useAutoSync({
    onSyncSuccess: onSuccess,
  });

  useEffect(() => {
    const onAnnotationChanged = () => {
      setDisable(
        !core.getAnnotationsList().some((annot) => annot instanceof window.Core.Annotations.RedactionAnnotation)
      );
    };

    core.addEventListener('annotationChanged', onAnnotationChanged);
    return () => {
      core.removeEventListener('annotationChanged', onAnnotationChanged);
    };
  }, []);

  const handleApplyRedaction = async () => {
    const annots = core.getAnnotationsList().filter((annot) => core.isAnnotationRedactable(annot));
    shouldExitRedact.current = true;
    await applyRedaction(annots as Core.Annotations.RedactionAnnotation[]);
    core.setToolMode(defaultTool as ToolName);
    shouldExitRedact.current = true;
    await updateUserMetadataFromFLPSearchParams(PdfAction.REDACT_PDF, ExploredFeatureKeys.REDACT_PDF);
  };

  const handleDiscard = () => {
    const annots = core.getAnnotationsList().filter((annot) => core.isAnnotationRedactable(annot));
    core.deleteAnnotations(annots, { imported: true });
    core.setToolMode(defaultTool as ToolName);
  };

  return (
    <SecondaryToolbar.Container>
      <SecondaryToolbar.LeftSection>
        <Icomoon type="redact-tool-lg" size="md" color="var(--kiwi-colors-surface-on-surface)" />
        <SecondaryToolbar.ToolTitle>{t('annotation.redact')}</SecondaryToolbar.ToolTitle>
        <SecondaryToolbar.Divider />
        <SecondaryToolbar.ToolDescription>{t('option.redaction.description')}</SecondaryToolbar.ToolDescription>
      </SecondaryToolbar.LeftSection>
      <SecondaryToolbar.RightSection>
        <Button variant="text" size="md" onClick={handleDiscard}>
          {t('common.discard')}
        </Button>
        <Button variant="tonal" size="md" disabled={disabled} onClick={handleApplyRedaction}>
          {t('warning.redaction.applyTitle')}
        </Button>
      </SecondaryToolbar.RightSection>
    </SecondaryToolbar.Container>
  );
};

export default RedactToolbar;
