import { MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { AvailabilityToolCheckProvider, ToolPopperRenderParams } from '@new-ui/HOCs/withValidUserCheck';

import { useGetCurrentUser } from 'hooks/useGetCurrentUser';

import TOOLS_NAME from 'constants/toolsName';

import { useFormFieldDetectionUsage } from '../hooks/useFormFieldDetectionUsage';
import { useIsValidDocumentForFormFieldDetection } from '../hooks/useIsValidDocumentForFormFieldDetection';
import { useProcessFormFieldDetection } from '../hooks/useProcessFormFieldDetection';
import useShowModal from '../hooks/useShowModal';

type DetectFormFieldButtonProps = {
  onClose?: () => void;
  dataCy?: string;
  dataLuminBtnName: string;
  dataLuminBtnPurpose?: string;
  onClick: (renderParams: ToolPopperRenderParams, openToolCallback: () => void) => void;
  onClickCallback?: () => void;
  leftSection: React.ReactNode;
  children: React.ReactNode;
};

const DetectFormFieldButton = ({
  onClose = () => {},
  dataCy,
  dataLuminBtnName,
  dataLuminBtnPurpose = '',
  onClick,
  onClickCallback = () => {},
  leftSection,
  children,
}: DetectFormFieldButtonProps) => {
  const { isOverFFDQuota, isLoadingFFDUsage, overFFDQuotaMessage } = useFormFieldDetectionUsage();
  const { isValidDocumentForFormFieldDetection } = useIsValidDocumentForFormFieldDetection();
  const currentUser = useGetCurrentUser();
  const applyFormFieldDetection = useProcessFormFieldDetection();
  const { showPreconditionNotMatchModal } = useShowModal();

  const handleClick = () => {
    onClickCallback();
    if (!isValidDocumentForFormFieldDetection) {
      showPreconditionNotMatchModal();
    } else {
      applyFormFieldDetection().catch(() => {});
    }
  };

  return (
    <AvailabilityToolCheckProvider
      toolName={TOOLS_NAME.FORM_FIELD_DETECTION}
      popperPlacement="right-start"
      popperContainerWidth={304}
      useModal
      onClose={onClose}
      render={(renderParams: ToolPopperRenderParams) => (
        <PlainTooltip content={overFFDQuotaMessage} position="bottom" maw={270}>
          <span>
            <MenuItem
              leftSection={leftSection}
              data-lumin-btn-name={dataLuminBtnName}
              data-lumin-btn-purpose={dataLuminBtnPurpose}
              data-cy={dataCy}
              onClick={() => onClick(renderParams, handleClick)}
              py="var(--kiwi-spacing-0-5)"
              activated={renderParams.isOpen}
              disabled={currentUser && (isLoadingFFDUsage || isOverFFDQuota)}
            >
              {children}
            </MenuItem>
          </span>
        </PlainTooltip>
      )}
    />
  );
};

export default DetectFormFieldButton;
