import { createContext, SetStateAction, Dispatch } from 'react';

export type AnnotationPopupContextValue = {
  setIsStylePopupOpen: Dispatch<SetStateAction<boolean>>;
  annotation?: Core.Annotations.Annotation;
};

export const AnnotationPopupContext = createContext<AnnotationPopupContextValue | null>(null);
