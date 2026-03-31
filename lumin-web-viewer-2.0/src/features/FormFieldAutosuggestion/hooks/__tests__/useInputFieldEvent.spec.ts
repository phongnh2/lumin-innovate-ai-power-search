jest.mock('lodash/debounce', () => (fn: any) => {
  const debouncedFn = (...args: any[]) => fn(...args);
  debouncedFn.cancel = jest.fn();
  debouncedFn.flush = jest.fn();
  return debouncedFn;
});

jest.mock('features/FormFieldAutosuggestion', () => ({
  formFieldAutocompleteBase: { put: jest.fn() },
  isAutocompleteItem: jest.fn(),
  getNextWrappingIndex: jest.fn(),
}));

import { renderHook, act } from '@testing-library/react';
import { useInputFieldEvent } from '../useInputFieldEvent';
import { 
  getNextWrappingIndex, 
  formFieldAutocompleteBase, 
  isAutocompleteItem 
} from 'features/FormFieldAutosuggestion';
import { KeyboardKeys } from 'constants/keyboardKey';

describe('useInputFieldEvent', () => {
  let inputEl: HTMLInputElement;
  let props: any;

  beforeEach(() => {
    jest.clearAllMocks();
    inputEl = document.createElement('input');

    props = {
      isMouseClickMenuRef: { current: false },
      highlightRef: { current: null },
      setInputEl: jest.fn(),
      setSearchResult: jest.fn(),
      setHighlightedIndex: jest.fn(),
      inputEl,
      fuseSearchRef: { current: { search: jest.fn() } },
      fieldRef: { current: { setValue: jest.fn() } },
      searchResultRef: { current: [] },
    };

    // ✅ Fix for ArrowDown/Up: Execute the updater function passed to the state setter
    props.setHighlightedIndex.mockImplementation((updater: any) => {
      if (typeof updater === 'function') {
        // Simulate current index is 0
        updater(0);
      }
    });
  });

  describe('handleKeyDown Logic Branches', () => {
    it('should return early if search results are empty', () => {
      props.searchResultRef.current = [];
      renderHook(() => useInputFieldEvent(props));

      const event = new KeyboardEvent('keydown', { key: KeyboardKeys.ARROW_DOWN });
      inputEl.dispatchEvent(event);

      expect(getNextWrappingIndex).not.toHaveBeenCalled();
    });

    it('should update value and highlight on ArrowDown', () => {
      // Branch: KeyboardKeys.ARROW_DOWN
      props.searchResultRef.current = ['A', 'B', 'C'];
      (getNextWrappingIndex as jest.Mock).mockReturnValue(1);

      renderHook(() => useInputFieldEvent(props));

      const event = new KeyboardEvent('keydown', { key: KeyboardKeys.ARROW_DOWN });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      
      inputEl.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(getNextWrappingIndex).toHaveBeenCalledWith(1, 0, 3);
      expect(props.fieldRef.current.setValue).toHaveBeenCalledWith('B');
      expect(props.highlightRef.current).toBe(1);
    });

    it('should update value and highlight on ArrowUp', () => {
      // Branch: KeyboardKeys.ARROW_UP
      props.searchResultRef.current = ['A', 'B', 'C'];
      (getNextWrappingIndex as jest.Mock).mockReturnValue(2);

      renderHook(() => useInputFieldEvent(props));

      const event = new KeyboardEvent('keydown', { key: KeyboardKeys.ARROW_UP });
      inputEl.dispatchEvent(event);

      expect(getNextWrappingIndex).toHaveBeenCalledWith(-1, 0, 3);
      expect(props.fieldRef.current.setValue).toHaveBeenCalledWith('C');
      expect(props.highlightRef.current).toBe(2);
    });

    it('should put value and clear input on Enter if an item is highlighted', () => {
      // Branch: KeyboardKeys.ENTER and highlightRef.current !== null
      props.searchResultRef.current = ['Selected Item'];
      props.highlightRef.current = 0;

      renderHook(() => useInputFieldEvent(props));

      const event = new KeyboardEvent('keydown', { key: KeyboardKeys.ENTER });
      inputEl.dispatchEvent(event);

      expect(formFieldAutocompleteBase.put).toHaveBeenCalledWith('Selected Item');
      expect(props.setInputEl).toHaveBeenCalledWith(null);
    });

    it('should only clear input on Enter if NO item is highlighted', () => {
      // Branch: KeyboardKeys.ENTER and highlightRef.current === null
      props.searchResultRef.current = ['Item'];
      props.highlightRef.current = null;

      renderHook(() => useInputFieldEvent(props));

      const event = new KeyboardEvent('keydown', { key: KeyboardKeys.ENTER });
      inputEl.dispatchEvent(event);

      expect(formFieldAutocompleteBase.put).not.toHaveBeenCalled();
      expect(props.setInputEl).toHaveBeenCalledWith(null);
    });
  });

  describe('handleInputChange (Search Logic)', () => {
    it('should not search if fuse is missing or value is empty', () => {
      props.fuseSearchRef.current = null;
      renderHook(() => useInputFieldEvent(props));

      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: { value: 'test' } });
      inputEl.dispatchEvent(event);

      expect(props.setSearchResult).not.toHaveBeenCalled();
    });

    it('should perform search and sort by score, count, and date', () => {
      const res1 = { item: { content: 'better-score', count: 1, dateStamp: 1 }, score: 0.1 };
      const res2 = { item: { content: 'higher-count', count: 10, dateStamp: 1 }, score: 0.5 };
      const res3 = { item: { content: 'newer-date', count: 10, dateStamp: 500 }, score: 0.5 };
      
      props.fuseSearchRef.current.search.mockReturnValue([res2, res1, res3]);
      renderHook(() => useInputFieldEvent(props));

      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: { value: 'query' } });
      inputEl.dispatchEvent(event);

      // Sorting check: res1 (lowest score), res3 (same score but newer date than res2), res2
      expect(props.setSearchResult).toHaveBeenCalledWith(['better-score', 'newer-date', 'higher-count']);
    });

    it('should sort by count when scores are equal but counts differ', () => {
      // Both have same score but different counts - tests line 48
      const res1 = { item: { content: 'low-count', count: 5, dateStamp: 100 }, score: 0.3 };
      const res2 = { item: { content: 'high-count', count: 20, dateStamp: 100 }, score: 0.3 };
      
      props.fuseSearchRef.current.search.mockReturnValue([res1, res2]);
      renderHook(() => useInputFieldEvent(props));

      const event = new Event('input');
      Object.defineProperty(event, 'target', { value: { value: 'query' } });
      inputEl.dispatchEvent(event);

      // Higher count should come first when scores are equal
      expect(props.setSearchResult).toHaveBeenCalledWith(['high-count', 'low-count']);
    });
  });

  describe('onBlur Logic', () => {
    it('should close menu on blur if not clicking menu or item', () => {
      // Branch: !isFocusAutocompleteItem && !isMouseClickMenuRef.current && isNull(highlightRef.current)
      props.highlightRef.current = null;
      props.isMouseClickMenuRef.current = false;
      (isAutocompleteItem as jest.Mock).mockReturnValue(false);

      renderHook(() => useInputFieldEvent(props));
      
      inputEl.dispatchEvent(new Event('blur'));

      expect(props.setInputEl).toHaveBeenCalledWith(null);
      expect(props.setSearchResult).toHaveBeenCalledWith([]);
      expect(props.setHighlightedIndex).toHaveBeenCalledWith(null);
    });

    it('should NOT close menu if an item is highlighted', () => {
      // Branch: highlightRef.current is NOT null
      props.highlightRef.current = 0;
      renderHook(() => useInputFieldEvent(props));
      
      inputEl.dispatchEvent(new Event('blur'));

      expect(props.setInputEl).not.toHaveBeenCalled();
    });
  });

  it('should clean up listeners on unmount', () => {
    const removeSpy = jest.spyOn(inputEl, 'removeEventListener');
    const { unmount } = renderHook(() => useInputFieldEvent(props));
    
    unmount();
    
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('input', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('blur', expect.any(Function));
  });
});