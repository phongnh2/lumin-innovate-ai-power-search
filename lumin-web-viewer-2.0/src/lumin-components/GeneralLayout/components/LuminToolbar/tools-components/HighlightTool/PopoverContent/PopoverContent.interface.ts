import { ToolName } from 'core/type';

export interface IPopoverContentProps {
  currentTool: string;
  activeToolName?: ToolName;
  isInReadAloudMode?: boolean;
  isNavigationTabPopover?: boolean;
  setCurrentTool: (arg: string) => void;
  onChangeNavigationTab?: () => boolean;
  toggleCheckPopper?: (options?: { toolName?: string }) => void;
}
