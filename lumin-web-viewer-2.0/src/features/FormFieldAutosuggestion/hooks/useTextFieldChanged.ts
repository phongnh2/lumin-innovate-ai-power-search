import isNull from 'lodash/isNull';
import { useEffect } from 'react';

import core from 'core';

import {
  formFieldAutocompleteBase,
  isAutocompleteItem,
  MAX_CHARACTERS_LENGTH,
  MIN_CHARACTERS_LENGTH,
} from 'features/FormFieldAutosuggestion';

import { WIDGET_TYPE } from 'constants/formBuildTool';

type Props = {
  isMouseClickMenuRef: React.MutableRefObject<boolean>;
  highlightRef: React.MutableRefObject<number>;
  isEnabledRef: React.MutableRefObject<boolean>;
};

export const useTextFieldChanged = (props: Props): void => {
  const { isMouseClickMenuRef, highlightRef, isEnabledRef } = props;
  const handleTextFieldChange = async (field: Core.Annotations.Forms.Field, value: string): Promise<void> => {
    const isMultiline = field.flags.get(window.Core.Annotations.WidgetFlags.MULTILINE);
    const isValidField = field.type === WIDGET_TYPE.TEXT && !isMultiline;
    if (!isValidField) {
      return;
    }

    const newValue = value?.trim() ?? '';
    const isValidContent =
      newValue.length && newValue.length >= MIN_CHARACTERS_LENGTH && newValue.length <= MAX_CHARACTERS_LENGTH;

    const { activeElement } = window.document;
    const isFocusAutocompleteItem = isAutocompleteItem(activeElement);
    const isUserFinishedTyping = !isMouseClickMenuRef.current && !isFocusAutocompleteItem;

    if (
      isValidField &&
      isValidContent &&
      isEnabledRef.current &&
      isUserFinishedTyping &&
      isNull(highlightRef.current)
    ) {
      await formFieldAutocompleteBase.put(newValue);
    }
  };
  useEffect(() => {
    core.getAnnotationManager().addEventListener('fieldChanged', handleTextFieldChange);
    return () => {
      core.getAnnotationManager().removeEventListener('fieldChanged', handleTextFieldChange);
    };
  }, []);
};
