import { FORM_BUILDER_TOOL_ITEM } from './constants';

export interface IToolPopperRenderParams {
  toggleCheckPopper: () => void;
  shouldShowPremiumIcon: boolean;
  isToolAvailable: boolean;
  isOpen?: boolean;
  withToolbarPopover?: boolean;
}

export interface FormBuilderItemProps {
  onCleanUp: () => void;
  onClick: (renderParams: IToolPopperRenderParams) => void;
  isInToolbarPopover?: boolean;
}

export interface FormBuilderToolProps {
  showFormFieldDetectionMenuItem: boolean;
  specificTool?: FORM_BUILDER_TOOL_ITEM;
}
