import { KiwiProvider, Select, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { useState, useEffect } from 'react';

import core from 'core';

import styles from './ChoiceWidgetSelect.module.scss';

const ChoiceWidgetSelect = ({
  annotation,
}: {
  annotation: Core.Annotations.ChoiceWidgetAnnotation & { options: { value: string; displayValue: string }[] };
}) => {
  const [value, setValue] = useState(annotation.value as string);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isReadOnly = annotation.fieldFlags.get(window.Core.Annotations.WidgetFlags.READ_ONLY);

  useEffect(() => {
    const onFieldChanged = (field: Core.Annotations.Forms.Field, newValue: string) => {
      if (field.name === annotation.fieldName) {
        setValue(newValue);
      }
    };
    core.addEventListener('fieldChanged', onFieldChanged);
    return () => {
      core.removeEventListener('fieldChanged', onFieldChanged);
    };
  }, [annotation]);

  const onChange = (newValue: string) => {
    annotation.setValue(newValue);
    annotation.getField().setValue(newValue);
    annotation.refresh();
  };
  const onDropdownOpen = () => {
    if (isReadOnly) {
      return;
    }
    setIsDropdownOpen(true);
  };
  const onDropdownClose = () => {
    setIsDropdownOpen(false);
  };
  return (
    <KiwiProvider>
      <PlainTooltip content={value} disabled={isDropdownOpen}>
        <Select
          {...(isReadOnly ? { dropdownOpened: false } : {})}
          data={annotation.options.map((option) => ({ value: option.value, label: option.displayValue }))}
          value={value}
          onChange={onChange}
          classNames={{
            wrapper: styles.wrapper,
            root: styles.root,
            dropdown: styles.dropdown,
          }}
          onDropdownOpen={onDropdownOpen}
          onDropdownClose={onDropdownClose}
        />
      </PlainTooltip>
    </KiwiProvider>
  );
};
export default ChoiceWidgetSelect;
