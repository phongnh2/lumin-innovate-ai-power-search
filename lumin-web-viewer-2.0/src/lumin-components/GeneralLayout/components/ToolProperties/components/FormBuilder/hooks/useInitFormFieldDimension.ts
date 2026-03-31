import { useEffect } from 'react';

import { useFormBuilderContext } from '../formBuilderContext';
import { useFormFieldDimensionContext } from '../FormFieldDimensionContext';

type FormFieldAnnotation = {
  Width: number;
  Height: number;
};

export const useInitFormFieldDimension = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const { formFieldAnnotation } = useFormBuilderContext() as { formFieldAnnotation: FormFieldAnnotation };
  const { setDimension } = useFormFieldDimensionContext();
  useEffect(() => {
    setDimension({
      width: Math.round(formFieldAnnotation.Width),
      height: Math.round(formFieldAnnotation.Height),
    });
  }, []);
};
