import { IconButton, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

type ChatBotQuickActionsHeaderProps = {
  onBack: () => void;
};

const ChatBotQuickActionsHeader = ({ onBack }: ChatBotQuickActionsHeaderProps) => {
  const { t } = useTranslation();
  return (
    <>
      <IconButton icon="ph-caret-left" onClick={onBack} />
      <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
        {t('viewer.quickActions.title')}
      </Text>
    </>
  );
};

export default ChatBotQuickActionsHeader;
