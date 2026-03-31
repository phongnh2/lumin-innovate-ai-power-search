import { useEffect, useState } from 'react';

type UseRemoveHighlightProps = {
  isHighlight: boolean;
};

type UseRemoveHighlightData = {
  isRemovedHighlight: boolean;
};

const useRemoveHighlight = ({ isHighlight }: UseRemoveHighlightProps): UseRemoveHighlightData => {
  const [isRemovedHighlight, setIsRemovedHighlight] = useState(true);

  useEffect(() => {
    setIsRemovedHighlight(!isHighlight);
  }, [isHighlight]);

  useEffect(() => {
    const onclickHandler = () => {
      setIsRemovedHighlight(true);
    };

    if (!isRemovedHighlight) {
      document.addEventListener('click', onclickHandler);
    }

    return () => {
      document.removeEventListener('click', onclickHandler);
    };
  }, [isRemovedHighlight]);

  return { isRemovedHighlight };
};

export default useRemoveHighlight;
