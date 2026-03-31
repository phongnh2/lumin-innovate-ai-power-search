import { useKey } from 'react-use';

const useSearchInputShortkey = (inputRef) => {
  useKey('k', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      inputRef.current.focus();
    }
  });
  useKey('Escape', () => {
    inputRef.current.blur();
  });
};

export default useSearchInputShortkey;
