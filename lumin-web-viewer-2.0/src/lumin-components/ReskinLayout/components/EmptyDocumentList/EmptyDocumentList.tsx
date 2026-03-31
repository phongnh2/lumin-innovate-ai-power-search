import { Text, TextType, TextSize } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import EmptyDocumentListImage from 'assets/reskin/images/empty-document-list.png';

import withDropDocPopup from 'HOC/withDropDocPopup';

import { useTranslation } from 'hooks';

import { folderType } from 'constants/documentConstants';

import EmptyWithUploadContainer from './components/EmptyWithUploadContainer';

import styles from './EmptyDocumentList.module.scss';

interface EmptyDocumentListProps {
  pageType: string;
  onFilesPicked: (files: File[], uploadFrom?: string) => void;
  disabled: boolean;
  folderId?: string;
}

function EmptyDocumentList({ pageType, onFilesPicked, disabled, folderId }: EmptyDocumentListProps) {
  const { t } = useTranslation();

  const getContentEmptyDocument = () => {
    switch (pageType) {
      case folderType.SHARED:
        return <>{t('documentPage.reskin.messageNoSharedDocument')}</>;
      case folderType.STARRED:
        return <>{t('documentPage.reskin.messageNoStarredDocument')}</>;
      case folderType.RECENT:
        return <Trans i18nKey="documentPage.reskin.messageNoRecentDocument" components={{ b: <b /> }} />;
      default:
        return null;
    }
  };

  const generateContent = () => {
    const contentEmpty = getContentEmptyDocument();
    if (!contentEmpty) {
      return <EmptyWithUploadContainer onFilesPicked={onFilesPicked} disabled={disabled} folderId={folderId} />;
    }

    return (
      <div className={styles.emptyContainer}>
        <img className={styles.emptyImage} src={EmptyDocumentListImage} alt="empty document list" />
        <Text type={TextType.body} size={TextSize.lg} className={styles.emptyDescription}>
          {contentEmpty}
        </Text>
      </div>
    );
  };

  return <div className={styles.container}>{generateContent()}</div>;
}

export default withDropDocPopup.Consumer(EmptyDocumentList);
