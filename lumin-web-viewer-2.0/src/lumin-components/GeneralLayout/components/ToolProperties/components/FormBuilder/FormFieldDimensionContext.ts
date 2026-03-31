import { createContext, useContext } from 'react';

export type FormFieldDimensionContextType = {
  width: number;
  height: number;
  setDimension: ({ width, height }: { width?: number; height?: number }) => void;
};

export const FormFieldDimensionContext = createContext<FormFieldDimensionContextType>({
  width: 0,
  height: 0,
  setDimension: () => {},
});

export const useFormFieldDimensionContext = () => useContext(FormFieldDimensionContext);
