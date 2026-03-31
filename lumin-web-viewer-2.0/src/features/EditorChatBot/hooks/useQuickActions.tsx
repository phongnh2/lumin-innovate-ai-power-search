import { ChatCircleTextIcon } from '@luminpdf/icons/dist/csr/ChatCircleText';
import React, { useCallback } from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { QuickActionItem } from 'features/AIChatBot/components/ChatBotQuickActions';
import {
  QUICK_ACTION_CATEGORIES_MAP,
  QUICK_ACTION_DEFINITIONS,
  QUICK_ACTION_GROUPS_MAP,
} from 'features/EditorChatBot/constants/quickActions';

import { QuickActionConfig, QuickActionGroupCollection, QuickActionItemId } from 'interfaces/quickActions';

import { useChatbotStore } from './useChatbotStore';

export const useQuickActions = () => {
  const { t } = useTranslation();
  const { setActiveQuickActionCategory, activeQuickActionCategory } = useChatbotStore();

  const createActionItem = useCallback(
    (collectionId: string, itemId: QuickActionItemId, collectionIcon?: React.ReactElement): QuickActionItem => {
      const definition = QUICK_ACTION_DEFINITIONS[itemId];
      const { item, category } = definition;
      const categoryConfig = QUICK_ACTION_CATEGORIES_MAP[collectionId];
      const { category: translationCategory, translationIndex } = item;

      if (!definition) {
        throw new Error(`Quick action ${itemId} not found`);
      }

      return {
        name: t(`viewer.quickActions.${translationCategory}.items.${translationIndex}.name`),
        id: itemId,
        icon: collectionIcon || categoryConfig?.icon || category.icon || <ChatCircleTextIcon />,
        category: collectionId,
        description: t(`viewer.quickActions.${translationCategory}.items.${translationIndex}.description`),
        prompt: t(`viewer.quickActions.${translationCategory}.items.${translationIndex}.prompt`),
        mode: definition.mode,
      };
    },
    [t]
  );

  const createCategoryItems = useCallback(
    (config: QuickActionConfig): QuickActionItem[] =>
      config.items.map((itemId) => createActionItem(config.id, itemId, config.icon)),
    [createActionItem]
  );

  const createGroupItems = useCallback(
    (group: QuickActionGroupCollection): QuickActionItem[] =>
      group.items.map((itemId) => createActionItem(group.id, itemId)),
    [createActionItem]
  );

  const quickActions = useCallback(
    (configs: QuickActionConfig[]) =>
      configs.reduce((acc, config) => {
        const categoryConfig = QUICK_ACTION_CATEGORIES_MAP[config.id];

        acc[config.id] = {
          title:
            config.title ||
            categoryConfig?.title ||
            t(categoryConfig?.translationKey || `viewer.quickActions.${config.id}.title`),
          items: createCategoryItems(config),
        };
        return acc;
      }, {} as Record<string, { title: string; items: QuickActionItem[] }>),
    [t, createCategoryItems]
  );

  const getQuickActionGroups = useCallback(
    (groups: QuickActionGroupCollection[]) =>
      groups.reduce((acc, group) => {
        const groupConfig = QUICK_ACTION_GROUPS_MAP[group.id];

        acc[group.id] = {
          title:
            group.title ||
            groupConfig?.title ||
            t(groupConfig?.translationKey || `viewer.quickActions.${group.id}.title`),
          items: createGroupItems(group),
          rightSection: group.rightSection,
        };
        return acc;
      }, {} as Record<string, { title: string; items: QuickActionItem[]; rightSection?: React.ReactNode }>),
    [t, createGroupItems]
  );

  const onSelectCategory = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, id: string) => {
      setActiveQuickActionCategory(id);
    },
    [setActiveQuickActionCategory]
  );

  const filteredQuickActions = useCallback(
    (configs: QuickActionConfig[]) => {
      const allActions = quickActions(configs);
      const isAllCategory = activeQuickActionCategory === 'all';

      if (isAllCategory || !activeQuickActionCategory) {
        return allActions;
      }

      return { [activeQuickActionCategory]: allActions[activeQuickActionCategory] };
    },
    [quickActions, activeQuickActionCategory]
  );

  return {
    getQuickActions: filteredQuickActions,
    getQuickActionGroups,
    onSelectCategory,
    activeQuickActionCategory,
  };
};
