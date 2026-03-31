import { useRef } from 'react';

export const useSelectedMark = (inputRef: React.RefObject<HTMLDivElement>) => {
  const selectedMarkRef = useRef<HTMLElement | null>(null);

  const focusSelectedMark = () => {
    if (selectedMarkRef.current) {
      const markNode = selectedMarkRef.current;
      selectedMarkRef.current.setAttribute('data-selected', 'true');
      const range = document.createRange();
      const selection = window.getSelection();

      range.setStart(markNode, 0);
      range.collapse(true);

      selection?.removeAllRanges();
      selection?.addRange(range);

      inputRef.current?.focus();
    }
  };

  const resetSelectedMark = () => {
    selectedMarkRef.current?.removeAttribute('data-selected');
    selectedMarkRef.current = null;
  };

  const removeSelectedMark = () => {
    if (selectedMarkRef.current) {
      selectedMarkRef.current.remove();
      selectedMarkRef.current = null;
    }
  };

  const handleMarkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { target } = e;
    e.stopPropagation();
    if (target instanceof HTMLElement && target.closest('mark')) {
      selectedMarkRef.current = target.closest('mark');
      focusSelectedMark();
    } else {
      resetSelectedMark();
    }
  };

  return {
    selectedMarkRef,
    focusSelectedMark,
    resetSelectedMark,
    removeSelectedMark,
    handleMarkClick,
  };
};