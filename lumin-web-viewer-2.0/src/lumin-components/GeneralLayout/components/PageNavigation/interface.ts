import { InputType } from './components/InputButton';
import { NavigateType } from './hook/usePageNavigate';
import { ZoomTypes } from './hook/useZoomDocument';

export interface IPageNavigationProps {
  isDisabled: boolean;
  isPageInfoAvaiable: boolean;
  isRightPanelOpen: boolean;
  isLeftPanelOpen: boolean;
  isToolPropertiesOpen: boolean;
  isPreviewOriginalVersionMode: boolean;
  isInFocusMode: boolean;
  isInPresenterMode: boolean;
}

export interface IPageIndicationProps {
  disabledInput?: boolean;
  isInPresenterMode?: boolean;
}

export interface IInputButtonProps {
  defaultValue?: string | number;
  isDisabled?: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLFormElement, Element>) => void;
  onFocus: (event: React.FocusEvent<HTMLFormElement, Element>) => void;
  inputType: InputType;
  value: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export interface IUsePageNavigate {
  validatePageInput: (page: number) => boolean;
  getValidPageNumber: (page: string) => number;
  getPageByAction: (action: NavigateType) => number;
}

export interface IUseZoomDocument {
  validatedZoomInput: (page: number) => boolean;
  getDefaultZoomLevel: () => number;
  getValidZoomLevel: (zoomLevel: string, shouldToastError?: boolean) => number;
  getRatioFromZoomLevel: (zoomLevel: number) => number;
  getZoomLevelFromRatio: (ratio: number) => number;
  onZoomByAction: (action: ZoomTypes) => void;
  currentZoomLevel: number;
}
