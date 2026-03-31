import { ChatCircleTextIcon } from '@luminpdf/icons/dist/csr/ChatCircleText';
import { CirclesThreePlusIcon } from '@luminpdf/icons/dist/csr/CirclesThreePlus';
import { FileIcon } from '@luminpdf/icons/dist/csr/File';
import { PenIcon } from '@luminpdf/icons/dist/csr/Pen';
import React from 'react';

import { AI_MODE } from 'features/AIChatBot/constants/mode';

import {
  QuickActionCategory,
  QuickActionCategoryConfig,
  QuickActionConfig,
  QuickActionDefinition,
  QuickActionGroup,
  QuickActionGroupCollection,
  QuickActionGroupConfig,
  QuickActionItemConfig,
  QuickActionItemId,
} from 'interfaces/quickActions';

import LinkToQuickActionView from '../components/LinkToQuickActionView';

export const EDIT_CATEGORY_CONFIG: QuickActionCategoryConfig = {
  id: QuickActionCategory.EDIT,
  icon: <PenIcon />,
  translationKey: 'viewer.quickActions.edit.title',
};

export const ASK_CATEGORY_CONFIG: QuickActionCategoryConfig = {
  id: QuickActionCategory.ASK,
  icon: <ChatCircleTextIcon />,
  translationKey: 'viewer.quickActions.ask.title',
};

export const INSERT_CATEGORY_CONFIG: QuickActionCategoryConfig = {
  id: QuickActionCategory.INSERT,
  icon: <CirclesThreePlusIcon />,
  translationKey: 'viewer.quickActions.insert.title',
};

export const ORGANIZE_CATEGORY_CONFIG: QuickActionCategoryConfig = {
  id: QuickActionCategory.ORGANIZE,
  icon: <FileIcon />,
  translationKey: 'viewer.quickActions.organize.title',
};

export const QUICK_ACTION_DEFINITIONS: Record<QuickActionItemId, QuickActionDefinition> = {
  [QuickActionItemId.SUMMARIZE]: {
    item: {
      id: QuickActionItemId.SUMMARIZE,
      category: QuickActionCategory.ASK,
      translationIndex: 0,
    },
    category: ASK_CATEGORY_CONFIG,
    mode: AI_MODE.ASK_MODE,
  },
  [QuickActionItemId.ASK_QUESTION]: {
    item: {
      id: QuickActionItemId.ASK_QUESTION,
      category: QuickActionCategory.ASK,
      translationIndex: 1,
    },
    category: ASK_CATEGORY_CONFIG,
    mode: AI_MODE.ASK_MODE,
  },
  [QuickActionItemId.ADD_OUTLINES]: {
    item: {
      id: QuickActionItemId.ADD_OUTLINES,
      category: QuickActionCategory.INSERT,
      translationIndex: 0,
    },
    category: INSERT_CATEGORY_CONFIG,
    mode: AI_MODE.AGENT_MODE,
  },
  [QuickActionItemId.INSERT_BLANK_PAGE]: {
    item: {
      id: QuickActionItemId.INSERT_BLANK_PAGE,
      category: QuickActionCategory.INSERT,
      translationIndex: 1,
    },
    category: INSERT_CATEGORY_CONFIG,
    mode: AI_MODE.AGENT_MODE,
  },
  [QuickActionItemId.REDACT]: {
    item: {
      id: QuickActionItemId.REDACT,
      category: QuickActionCategory.EDIT,
      translationIndex: 0,
    },
    category: EDIT_CATEGORY_CONFIG,
    mode: AI_MODE.AGENT_MODE,
  },
  [QuickActionItemId.REPLACE_ALL]: {
    item: {
      id: QuickActionItemId.REPLACE_ALL,
      category: QuickActionCategory.EDIT,
      translationIndex: 1,
    },
    category: EDIT_CATEGORY_CONFIG,
    mode: AI_MODE.AGENT_MODE,
  },
  [QuickActionItemId.HIGHLIGHT]: {
    item: {
      id: QuickActionItemId.HIGHLIGHT,
      category: QuickActionCategory.EDIT,
      translationIndex: 2,
    },
    category: EDIT_CATEGORY_CONFIG,
    mode: AI_MODE.AGENT_MODE,
  },
  [QuickActionItemId.UNDERLINE]: {
    item: {
      id: QuickActionItemId.UNDERLINE,
      category: QuickActionCategory.EDIT,
      translationIndex: 3,
    },
    category: EDIT_CATEGORY_CONFIG,
    mode: AI_MODE.AGENT_MODE,
  },
  [QuickActionItemId.STRIKE_THROUGH]: {
    item: {
      id: QuickActionItemId.STRIKE_THROUGH,
      category: QuickActionCategory.EDIT,
      translationIndex: 4,
    },
    category: EDIT_CATEGORY_CONFIG,
    mode: AI_MODE.AGENT_MODE,
  },
  [QuickActionItemId.ADD_SQUIGGLY_UNDERLINE]: {
    item: {
      id: QuickActionItemId.ADD_SQUIGGLY_UNDERLINE,
      category: QuickActionCategory.EDIT,
      translationIndex: 5,
    },
    category: EDIT_CATEGORY_CONFIG,
    mode: AI_MODE.AGENT_MODE,
  },
  [QuickActionItemId.MERGE]: {
    item: {
      id: QuickActionItemId.MERGE,
      category: QuickActionCategory.ORGANIZE,
      translationIndex: 0,
    },
    category: ORGANIZE_CATEGORY_CONFIG,
    mode: AI_MODE.AGENT_MODE,
  },
  [QuickActionItemId.SPLIT_AND_EXTRACT]: {
    item: {
      id: QuickActionItemId.SPLIT_AND_EXTRACT,
      category: QuickActionCategory.ORGANIZE,
      translationIndex: 1,
    },
    category: ORGANIZE_CATEGORY_CONFIG,
    mode: AI_MODE.AGENT_MODE,
  },
};

export const QUICK_ACTION_ITEMS_MAP: Record<string, QuickActionItemConfig> = Object.fromEntries(
  Object.entries(QUICK_ACTION_DEFINITIONS).map(([key, def]) => [key, def.item])
);

export const QUICK_ACTION_CATEGORIES_MAP: Record<string, QuickActionCategoryConfig> = {
  ...Object.fromEntries(
    Object.values(QUICK_ACTION_DEFINITIONS)
      .map((def) => def.category)
      .filter((cat, index, self) => self.findIndex((c) => c.id === cat.id) === index)
      .map((cat) => [cat.id, cat])
  ),
};

export const QUICK_ACTION_GROUPS_MAP: Record<string, QuickActionGroupConfig> = {
  [QuickActionGroup.POPULAR_PROMPTS]: {
    id: QuickActionGroup.POPULAR_PROMPTS,
    translationKey: 'viewer.quickActions.popularPrompts.title',
  },
  [QuickActionGroup.WHAT_CAN_I_HELP_WITH]: {
    id: QuickActionGroup.WHAT_CAN_I_HELP_WITH,
    translationKey: 'viewer.quickActions.whatCanIHelpWith.title',
  },
};

export const QUICK_ACTION_CONFIGS: QuickActionConfig[] = [
  {
    id: QuickActionCategory.ASK,
    icon: <ChatCircleTextIcon />,
    items: [QuickActionItemId.SUMMARIZE, QuickActionItemId.ASK_QUESTION],
    mode: AI_MODE.ASK_MODE,
  },
  {
    id: QuickActionCategory.INSERT,
    icon: <CirclesThreePlusIcon />,
    items: [QuickActionItemId.ADD_OUTLINES, QuickActionItemId.INSERT_BLANK_PAGE],
    mode: AI_MODE.AGENT_MODE,
  },
  {
    id: QuickActionCategory.EDIT,
    icon: <PenIcon />,
    items: [
      QuickActionItemId.REDACT,
      QuickActionItemId.REPLACE_ALL,
      QuickActionItemId.HIGHLIGHT,
      QuickActionItemId.UNDERLINE,
      QuickActionItemId.STRIKE_THROUGH,
      QuickActionItemId.ADD_SQUIGGLY_UNDERLINE,
    ],
    mode: AI_MODE.AGENT_MODE,
  },
  {
    id: QuickActionCategory.ORGANIZE,
    icon: <FileIcon />,
    items: [QuickActionItemId.MERGE, QuickActionItemId.SPLIT_AND_EXTRACT],
    mode: AI_MODE.AGENT_MODE,
  },
];

export const QUICK_ACTION_HOME_SCREEN_GROUPS: QuickActionGroupCollection[] = [
  {
    id: QuickActionGroup.POPULAR_PROMPTS,
    items: [QuickActionItemId.REPLACE_ALL, QuickActionItemId.HIGHLIGHT, QuickActionItemId.REDACT],
  },
  {
    id: QuickActionGroup.WHAT_CAN_I_HELP_WITH,
    rightSection: <LinkToQuickActionView />,
    items: [
      QuickActionItemId.SUMMARIZE,
      QuickActionItemId.UNDERLINE,
      QuickActionItemId.ASK_QUESTION,
      QuickActionItemId.SPLIT_AND_EXTRACT,
    ],
  },
];
