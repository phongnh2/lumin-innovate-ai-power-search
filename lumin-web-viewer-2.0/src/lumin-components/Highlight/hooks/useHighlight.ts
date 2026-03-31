import { useState } from 'react';

type UseHighlightData = {
  isHighlight: boolean;
  toggleHighlight(isOn: boolean): void;
};

const useHighlight = (): UseHighlightData => {
  const [isHighlight, setIsHighlight] = useState(false);

  const toggleHighlight = (isOn: boolean) => {
    setIsHighlight(isOn);
  };

  return {
    isHighlight,
    toggleHighlight,
  };
};

export default useHighlight;
