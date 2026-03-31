import { useEffect } from 'react';

interface FormBuildTextFieldProps {
  fontSizeList: { label: string; value: number }[];
  setFontSize: (value: number) => void;
  maxFontSize: number;
  fontSize: number;
}

export const useUpdateFontSize = (props: FormBuildTextFieldProps) => {
  const { setFontSize, maxFontSize, fontSize } = props;

  useEffect(() => {
    if (fontSize < maxFontSize) {
      return;
    }
    setFontSize(maxFontSize);
  }, [fontSize, maxFontSize]);
};
