import React from 'react';

export enum QuickActionCategory {
  ASK = 'ask',
  INSERT = 'insert',
  EDIT = 'edit',
  ORGANIZE = 'organize',
}

export enum QuickActionGroup {
  POPULAR_PROMPTS = 'popularPrompts',
  WHAT_CAN_I_HELP_WITH = 'whatCanIHelpWith',
}

export enum QuickActionItemId {
  SUMMARIZE = 'summarize',
  ASK_QUESTION = 'ask-question',
  ADD_OUTLINES = 'add-outlines',
  INSERT_BLANK_PAGE = 'insert-blank-page',
  REDACT = 'redact',
  REPLACE_ALL = 'replace-all',
  HIGHLIGHT = 'highlight',
  UNDERLINE = 'underline',
  STRIKE_THROUGH = 'strike-through',
  ADD_SQUIGGLY_UNDERLINE = 'add-squiggly-underline',
  MERGE = 'merge',
  SPLIT_AND_EXTRACT = 'split-and-extract',
}

export interface QuickActionItemConfig {
  id: QuickActionItemId;
  category: QuickActionCategory;
  translationIndex: number;
}

export interface QuickActionCategoryConfig {
  id: QuickActionCategory;
  icon?: React.ReactElement;
  translationKey: string;
  title?: string;
}

export interface QuickActionGroupConfig {
  id: QuickActionGroup;
  translationKey: string;
  title?: string;
}

export interface QuickActionConfig {
  id: QuickActionCategory;
  icon?: React.ReactElement;
  items: QuickActionItemId[];
  title?: string;
  mode: string;
}

export interface QuickActionGroupCollection {
  id: QuickActionGroup;
  items: QuickActionItemId[];
  title?: string;
  rightSection?: React.ReactNode;
}

export interface QuickActionDefinition {
  item: QuickActionItemConfig;
  category: QuickActionCategoryConfig;
  mode: string;
}
