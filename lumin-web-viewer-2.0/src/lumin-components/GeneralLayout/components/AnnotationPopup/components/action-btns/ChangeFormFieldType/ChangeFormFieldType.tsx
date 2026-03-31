import omit from 'lodash/omit';
import { MenuItemBase, Divider, Popover, PopoverTarget, PopoverDropdown } from 'lumin-ui/kiwi-ui';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { AnnotationPopupContext } from '@new-ui/components/AnnotationPopup/AnnotationPopupContext';

import SingleButton from 'luminComponents/ViewerCommonV2/ToolButton/SingleButton';

import { changeFormFieldType } from 'features/DocumentFormBuild/changeFormFieldType';

import { TOOLS_NAME } from 'constants/toolsName';

import useAnnotationPopupBtnCondition from '../../../hooks/useAnnotationPopupBtnCondition';

import styles from './ChangeFormFieldType.module.scss';

const ChangeFormFieldType = () => {
  const { t } = useTranslation();
  const { annotation } = useContext(AnnotationPopupContext) as unknown as {
    annotation: Core.Annotations.WidgetAnnotation;
  };
  const { showChangeFormFieldButton } = useAnnotationPopupBtnCondition();

  if (!showChangeFormFieldButton) {
    return null;
  }

  const labelMap = {
    [TOOLS_NAME.TEXT_FIELD]: t('viewer.formBuildPanel.textField'),
    [TOOLS_NAME.CHECK_BOX]: t('viewer.formBuildPanel.checkbox'),
    [TOOLS_NAME.SIGNATURE_FIELD]: t('viewer.formBuildPanel.signatureButton'),
    [TOOLS_NAME.LIST_BOX_FIELD]: t('viewer.formBuildPanel.listbox'),
    [TOOLS_NAME.COMBO_BOX_FIELD]: t('viewer.formBuildPanel.combobox'),
  } as const;

  const isDatePickerWidget = annotation instanceof window.Core.Annotations.DatePickerWidgetAnnotation;
  const fieldType = isDatePickerWidget
    ? t('viewer.formBuildPanel.datePicker')
    : labelMap[annotation.ToolName as keyof typeof labelMap];

  return (
    <>
      <Popover width={232} offset={12}>
        <PopoverTarget>
          <SingleButton
            showArrow
            label={fieldType}
            tooltipProps={{ content: t('viewer.formBuildPanel.changeFormFieldAction') }}
          />
        </PopoverTarget>
        <PopoverDropdown paddingVariant="dense">
          {Object.entries(omit(labelMap, [TOOLS_NAME.LIST_BOX_FIELD, TOOLS_NAME.COMBO_BOX_FIELD])).map(([key, value]) => {
            const isActive = !isDatePickerWidget && annotation.ToolName === key;
            return (
              <MenuItemBase
                key={key}
                activated={isActive}
                onClick={() => {
                  if (!isActive) {
                    changeFormFieldType(annotation, key as keyof typeof labelMap);
                  }
                }}
                leftIconProps={{ type: isActive ? 'check-md' : '' }}
              >
                {value}
              </MenuItemBase>
            );
            }
          )}
          {annotation.getValue() && (
            <>
              <Divider my="var(--kiwi-spacing-1)" color="var(--kiwi-colors-surface-outline-variant)" />
              <p className={styles.description}>{t('viewer.formBuildPanel.changeFormFields', { fieldType })}</p>
            </>
          )}
        </PopoverDropdown>
      </Popover>
      <Divider my="var(--kiwi-spacing-1)" color="var(--kiwi-colors-surface-outline-variant)" orientation="vertical" />
    </>
  );
};

export default ChangeFormFieldType;
