import React from 'react';

export type QuickSearchToolElementProps = {
  onClickNavigationButton: (value: string) => boolean;
};

export type QuickSearchToolType = {
  key: string;
  title: string;
  element: React.ReactNode | ((props: QuickSearchToolElementProps) => React.ReactNode);
};

export type QuickSearchGroupToolType = {
  key: string;
  label: string;
  tools: QuickSearchToolType[];
  toolbarValue?: string;
  onlyVisibleOnSearch?: boolean;
};
