import Fuse from 'fuse.js';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import React, { useEffect, useCallback } from 'react';

import { formFieldAutocompleteBase, isAutocompleteItem, getNextWrappingIndex } from 'features/FormFieldAutosuggestion';

import { KeyboardKeys } from 'constants/keyboardKey';

import { FormFieldSuggestion } from '../types';

type InputFieldEventProps = {
  isMouseClickMenuRef: React.MutableRefObject<boolean>;
  highlightRef: React.MutableRefObject<number>;
  setInputEl: React.Dispatch<React.SetStateAction<HTMLInputElement>>;
  setSearchResult: React.Dispatch<React.SetStateAction<string[]>>;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  inputEl: HTMLInputElement;
  fuseSearchRef: React.MutableRefObject<Fuse<FormFieldSuggestion>>;
  fieldRef: React.MutableRefObject<Core.Annotations.Forms.Field>;
  searchResultRef: React.MutableRefObject<string[]>;
};

const DEBOUNCE_TIME = 200;

export function useInputFieldEvent(props: InputFieldEventProps): void {
  const {
    isMouseClickMenuRef,
    highlightRef,
    setInputEl,
    setSearchResult,
    setHighlightedIndex,
    inputEl,
    fuseSearchRef,
    fieldRef,
    searchResultRef,
  } = props;

  const sortByMultipleCriteria = (
    a: Fuse.FuseResult<FormFieldSuggestion>,
    b: Fuse.FuseResult<FormFieldSuggestion>
  ): number => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    if (b.item.count !== a.item.count) {
      return b.item.count - a.item.count;
    }
    return b.item.dateStamp - a.item.dateStamp;
  };

  const debounceSearch = useCallback(
    debounce((value: string) => {
      if (!fuseSearchRef.current || !value?.length) {
        return;
      }
      const result = fuseSearchRef.current.search(value);

      const sortedResult = result.sort(sortByMultipleCriteria).map((res) => res.item.content);

      setSearchResult(sortedResult.slice(0, 5));
    }, DEBOUNCE_TIME),
    []
  );

  const handleInputChange = useCallback((event: InputEvent) => {
    const { value } = event.target as HTMLInputElement;
    debounceSearch(value);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isEmpty(searchResultRef.current)) {
      return;
    }

    if (event.key === KeyboardKeys.ARROW_DOWN) {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const newIndex = getNextWrappingIndex(1, prev, searchResultRef.current.length);
        highlightRef.current = newIndex;
        fieldRef.current.setValue(searchResultRef.current[newIndex]);
        return newIndex;
      });
    }

    if (event.key === KeyboardKeys.ARROW_UP) {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const newIndex = getNextWrappingIndex(-1, prev, searchResultRef.current.length);
        highlightRef.current = newIndex;
        fieldRef.current.setValue(searchResultRef.current[newIndex]);
        return newIndex;
      });
    }

    if (event.key === KeyboardKeys.ENTER) {
      if (highlightRef.current !== null) {
        event.preventDefault();
        const value = searchResultRef.current[highlightRef.current];
        formFieldAutocompleteBase.put(value) as unknown;
      }
      setInputEl(null);
    }
  }, []);

  useEffect(() => {
    const onBlur = (): void => {
      const { activeElement } = window.document;
      const isFocusAutocompleteItem = isAutocompleteItem(activeElement);
      if (!isFocusAutocompleteItem && !isMouseClickMenuRef.current && isNull(highlightRef.current)) {
        setInputEl(null);
        setSearchResult([]);
        setHighlightedIndex(null);
      }
    };
    if (inputEl) {
      inputEl.addEventListener('keydown', handleKeyDown);
      inputEl.addEventListener('input', handleInputChange);
      inputEl.addEventListener('blur', onBlur);
    }

    return () => {
      if (inputEl) {
        inputEl.removeEventListener('keydown', handleKeyDown);
        inputEl.removeEventListener('input', handleInputChange);
        inputEl.removeEventListener('blur', onBlur);
      }
    };
  }, [inputEl]);
}
