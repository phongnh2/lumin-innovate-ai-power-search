import { Button, Icomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useChatbotStore } from 'features/EditorChatBot/hooks/useChatbotStore';

import styles from './WarningRefresh.module.scss';

const WarningRefresh = ({
  onClick,
  message,
  buttonTitle,
  icon,
}: {
  onClick: () => Promise<boolean>;
  message: string;
  buttonTitle: string;
  icon: string;
}) => {
  const { isUploadingDocument } = useChatbotStore(
    useShallow((state) => ({
      isUploadingDocument: state.isUploadingDocument,
    }))
  );
  return (
    <div className={styles.container}>
      <Icomoon type={icon} size="md" />
      <p className={styles.description}>{message}</p>
      <Button onClick={onClick} className={styles.buttonConfirm} loading={isUploadingDocument}>
        {buttonTitle}
      </Button>
    </div>
  );
};

export default WarningRefresh;
