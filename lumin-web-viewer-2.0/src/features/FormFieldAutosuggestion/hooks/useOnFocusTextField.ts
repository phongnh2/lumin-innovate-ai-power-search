import React, { useEffect } from 'react';

import core from 'core';

type Props = {
  fieldRef: React.MutableRefObject<Core.Annotations.Forms.Field>;
  setInputEl: React.Dispatch<React.SetStateAction<HTMLInputElement>>;
  setSearchResult: React.Dispatch<React.SetStateAction<string[]>>;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
};

export const useOnFocusTextField = (props: Props): void => {
  const { fieldRef, setInputEl, setSearchResult, setHighlightedIndex } = props;
  const fieldManager = core.getAnnotationManager().getFieldManager();

  const handleFocusIn = (event: FocusEvent): void => {
    const element = event.target as HTMLElement;
    if (element instanceof window.HTMLInputElement) {
      const field = fieldManager.getField(element.offsetParent.id) as Core.Annotations.Forms.Field;
      setSearchResult([]);
      setHighlightedIndex(null);
      if (!field || field.flags.get(window.Core.Annotations.WidgetFlags.MULTILINE)) {
        fieldRef.current = null;
        setInputEl(null);
        return;
      }
      setInputEl(element);
      fieldRef.current = field;
    }
  };

  useEffect(() => {
    window.addEventListener('focusin', handleFocusIn);
    return () => {
      window.removeEventListener('focusin', handleFocusIn);
    };
  }, []);
};
