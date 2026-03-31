import classNames from 'classnames';
import { Chip, ChipColorType, ChipVariant } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { useChatBotQuickActions } from './ChatBotQuickActionsContext';

import styles from './ChatBotQuickActions.module.scss';

type ChatBotQuickActionsCategoryProps = {
  className?: string;
};
const ChatBotQuickActionsCategory = (props: ChatBotQuickActionsCategoryProps) => {
  const { className } = props;
  const { onSelectCategory, activeCategory, categories } = useChatBotQuickActions();
  const { t } = useTranslation();
  const isFirstItem = (index: number) => index === 0;

  const isLastItem = (index: number) => index === categories.length - 1;

  const isActive = (id: string) => activeCategory === id;

  return (
    <div className={classNames(styles.categoryList, className)}>
      {categories.map((item, index) => (
        <Chip
          className={styles.categoryItem}
          data-first-item={isFirstItem(index)}
          data-last-item={isLastItem(index)}
          data-no-icon={!item.icon}
          leftIcon={item.icon}
          rounded
          key={item.id}
          label={t(item.translationKey)}
          size="md"
          variant={ChipVariant.light}
          colorType={isActive(item.id) ? ChipColorType.blue : ChipColorType.grey}
          enablePointerEvents
          onClick={(e) => onSelectCategory(e as never, item.id)}
        />
      ))}
    </div>
  );
};

export default ChatBotQuickActionsCategory;
