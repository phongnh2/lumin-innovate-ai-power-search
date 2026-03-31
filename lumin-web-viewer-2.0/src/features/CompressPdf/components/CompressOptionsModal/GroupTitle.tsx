import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

const GroupTitle = ({ label }: { label: string }) => {
  const { t } = useTranslation();
  return (
    <Text type="title" size="md" color="var(--kiwi-colors-surface-on-surface)">
      {t(`viewer.compressPdf.options.${label}.title`)}
    </Text>
  );
};

export default GroupTitle;
