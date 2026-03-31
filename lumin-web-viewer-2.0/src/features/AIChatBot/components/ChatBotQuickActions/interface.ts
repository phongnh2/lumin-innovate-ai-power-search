export type QuickActionCategory = {
  name: string;
  translationKey: string;
  id: string;
  icon?: React.ReactElement;
};

export type QuickActionItem = {
  name?: string;
  id?: string;
  icon?: React.ReactElement;
  category?: string;
  description?: string;
  prompt: string;
  mode?: string;
};
