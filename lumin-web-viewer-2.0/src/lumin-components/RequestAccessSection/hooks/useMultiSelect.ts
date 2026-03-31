import { ChangeEvent, useCallback, useRef, useEffect } from 'react';
import { useEvent, useList } from 'react-use';

type UseMultiSelectPayload = {
  isSelectingAll: boolean;
  selected: string[];
  selectAll: () => void;
  onCheckboxChange: (e: ChangeEvent<HTMLInputElement>, id: string) => void;
  isIndeterminate: boolean;
  clear: () => void;
};

const useMultiSelect = (list: string[]): UseMultiSelectPayload => {
  const [selected, { push, removeAt, set, clear }] = useList([]);
  const shiftHolding = useRef(false);

  const isSelectingAll = (): boolean => list.length === selected.length;

  const isIndeterminate = (): boolean => Boolean(selected.length) && list.length !== selected.length;

  const selectAll = (): void => {
    if (isSelectingAll()) {
      clear();
    } else {
      set(list);
    }
  };

  const removeItem = useCallback(
    (idx: any) => {
      removeAt(selected.findIndex((_id) => _id === idx));
    },
    [removeAt, selected]
  );

  const handlePressEsc = (e: KeyboardEvent): void => {
    e.stopPropagation();
    clear();
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    switch (e.key) {
      case 'ArrowDown':
        if (shiftHolding.current) {
          // do something
        }
        break;
      case 'Escape': {
        handlePressEsc(e);
        break;
      }
      default:
        break;
    }
  };

  const handleShiftKey = (direction: 'up' | 'down') => (event: KeyboardEvent) => {
    if (event.key === 'Shift') {
      shiftHolding.current = direction === 'down';
    }
  };

  const onCheckboxChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, id: string): void => {
      if (e.target.checked) {
        push(id);
      } else {
        removeItem(id);
      }
    },
    [push, removeItem]
  );

  useEvent('keydown', onKeyDown);

  useEvent('keydown', handleShiftKey('down'));

  useEvent('keyup', handleShiftKey('up'));

  useEffect(() => {
    clear();
  }, [list.length]);

  return {
    isSelectingAll: isSelectingAll(),
    selected,
    selectAll,
    onCheckboxChange,
    isIndeterminate: isIndeterminate(),
    clear,
  };
};

export default useMultiSelect;
