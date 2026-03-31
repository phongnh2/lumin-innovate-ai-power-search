import { useEffect } from 'react';
import ReactQuill from 'react-quill';

interface IProps {
  inputRef: React.RefObject<ReactQuill>;
  isSelected: boolean;
}

export const useFocusWhenSelected = ({ inputRef, isSelected }: IProps): void => {
  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSelected, inputRef]);
};
