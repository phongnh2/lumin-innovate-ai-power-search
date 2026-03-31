import React from 'react';

import EmptyDragAndDropUpload from 'luminComponents/ReskinLayout/components/EmptyDocumentList/components/EmptyDragAndDropUpload';

import withDropDocPopup from 'HOC/withDropDocPopup';

import styles from './EmptyTemplateList.module.scss';

interface EmptyTemplateListProps {
  onFilesPicked: (files: File[], uploadFrom?: string) => void;
  disabled: boolean;
}

function EmptyTemplateList({ onFilesPicked, disabled }: EmptyTemplateListProps) {
  return (
    <div className={styles.container}>
      <EmptyDragAndDropUpload onFilesPicked={onFilesPicked} disableUpload={disabled} />
    </div>
  );
}

export default withDropDocPopup.Consumer(EmptyTemplateList);
