export type Option = {
  label: string;
  value: string;
  folderType: string;
  avatar?: string;
  disabled?: boolean;
};

export type RenderOptionProps = {
  option: Option;
  checked?: boolean;
};
