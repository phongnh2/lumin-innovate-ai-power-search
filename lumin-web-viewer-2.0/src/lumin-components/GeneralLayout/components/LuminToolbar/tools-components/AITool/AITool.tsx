import { Divider } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useIsSystemFile } from 'hooks/useIsSystemFile';
import { useViewerMode } from 'hooks/useViewerMode';

import EditInAgreementGenButton from 'features/AgreementGen/components/EditInAgreementGenButton';
import FormFieldDetectionTool from 'features/FormFieldDetection/components/FormFieldDetectionTool';
import { useEnabledFormFieldDetection } from 'features/FormFieldDetection/hooks/useEnabledFormFieldDetection';

const AITool = ({ toolValidateCallback }: { toolValidateCallback: () => boolean }) => {
  const { enabledFormFieldDetection } = useEnabledFormFieldDetection();
  const { isSystemFile } = useIsSystemFile();
  const { isOffline } = useViewerMode();
  const showFormFieldDetectionMenuItem = enabledFormFieldDetection && !isSystemFile && !isOffline;

  return (
    <>
      <EditInAgreementGenButton toolValidateCallback={toolValidateCallback} />
      {showFormFieldDetectionMenuItem && (
        <>
          <Divider style={{ margin: 'var(--kiwi-spacing-1) calc(var(--kiwi-spacing-1) * -1)' }} />
          <FormFieldDetectionTool />
        </>
      )}
    </>
  );
};

export default AITool;
