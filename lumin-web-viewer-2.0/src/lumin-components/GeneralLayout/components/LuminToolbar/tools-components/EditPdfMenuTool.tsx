import { Icomoon, IconSize, MenuItem, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useSelector } from 'react-redux';

import { LEFT_SIDE_BAR, LEFT_SIDE_BAR_VALUES } from '@new-ui/components/LuminLeftSideBar/constants';
import { useLeftSideBarFeatureValidation } from '@new-ui/components/LuminLeftSideBar/hooks/useLeftSideBarFeatureValidation';
import { AvailabilityToolCheckProvider } from '@new-ui/HOCs/withValidUserCheck';

import selectors from 'selectors';

import { useToolLabels } from 'features/QuickSearch/hooks/useToolLabels';

interface EditPdfMenuToolProps {
  onClickNavigationButton?: (value: string) => boolean;
}

const EditPdfMenuTool: React.FC<EditPdfMenuToolProps> = ({ onClickNavigationButton }) => {
  const isOffline = useSelector(selectors.isOffline);
  const { isFeatureDisabled, getTooltipContent } = useLeftSideBarFeatureValidation();
  const { getToolLabel } = useToolLabels();

  const { value, dataElement, toolName, eventName, validateMimeType, allowInTempEditMode } =
    LEFT_SIDE_BAR_VALUES.EDIT_PDF;

  return (
    <AvailabilityToolCheckProvider
      key={value}
      toolName={toolName}
      eventName={eventName}
      useModal
      render={({
        shouldShowPremiumIcon,
        toggleCheckPopper,
      }: {
        shouldShowPremiumIcon: boolean;
        toggleCheckPopper: () => void;
      }) => (
        <PlainTooltip content={getTooltipContent({ validateMimeType, allowInTempEditMode })} position="bottom">
          <MenuItem
            disabled={Boolean(isFeatureDisabled) || Boolean(isOffline)}
            leftSection={
              <Icomoon type="ph-pencil-simple" size={IconSize.lg} color="var(--kiwi-colors-surface-on-surface)" />
            }
            data-lumin-btn-name={dataElement}
            onClick={shouldShowPremiumIcon ? toggleCheckPopper : () => onClickNavigationButton(LEFT_SIDE_BAR.EDIT_PDF)}
          >
            {getToolLabel('common.editText', 'viewer.quickSearch.editPdfTools.editContent')}
          </MenuItem>
        </PlainTooltip>
      )}
    />
  );
};

export default EditPdfMenuTool;
