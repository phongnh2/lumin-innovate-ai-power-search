import { PaperProps, PopperProps } from '@mui/material';

export interface IOptions {
  label: string;
  value: string;
}

interface ISelectProps<OptionType> {
  checkIconPosition?: 'start' | 'end';
  canEditInput?: boolean;
  inputProps?: Record<string, unknown>;
  options: OptionType[];
  selectOnFocus?: boolean;
  slotProps?: {
    popper?: Partial<PopperProps> & { zIndex?: string };
    paper?: PaperProps;
  };
  labelKey?: string;
  valueKey?: string;
  value?: string | undefined | null;
  ListboxProps?: Record<string, unknown>;
  popupIconProps?: Record<string, unknown>;
  noFilter?: boolean;
  displayCheckIcon?: boolean;
  fullWidth?: boolean;
  onChange?: (event: React.SyntheticEvent, value: OptionType) => void;
  getOptionDisabled?: (option: OptionType) => boolean;
}

declare const Select: <OptionType>(props: ISelectProps<OptionType>) => JSX.Element;

export default Select;
