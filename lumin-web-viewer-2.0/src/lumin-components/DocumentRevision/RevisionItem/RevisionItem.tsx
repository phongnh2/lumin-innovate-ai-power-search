/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { dateUtil } from 'utils';

import { useLoadDocumentVersion } from 'features/DocumentRevision/hooks/useLoadDocumentVersion';
import { IDocumentRevision } from 'features/DocumentRevision/interface';

import * as Styled from './RevisionItem.styled';

interface IRevisionItemProps {
  isActive: boolean;
  revision?: IDocumentRevision;
  isCurrentVersion: boolean;
  disabled?: boolean;
  onRestore?: ({ event, revisionId }: { event: React.MouseEvent; revisionId: string }) => void;
  onlyCurrent?: boolean;
}

const versionPrefix = 'viewer.revision.version';

const RevisionItem = (props: IRevisionItemProps) => {
  const { isActive, revision, isCurrentVersion, disabled, onRestore, onlyCurrent } = props;
  const { t } = useTranslation();
  const lastModify: string = dateUtil.formatFullDate(new Date(revision?.modifiedTime).getTime());
  const { onDocumentVersionClick } = useLoadDocumentVersion();

  const renderContentTitle = () => {
    if (isCurrentVersion) {
      return t(versionPrefix, { context: 'current' });
    }
    return lastModify;
  };

  const onItemClick = () => {
    if (!revision) return;
    onDocumentVersionClick(revision).catch(() => {});
  };

  return (
    <Styled.RevisionItem onClick={onItemClick} $active={isActive} $disabled={disabled}>
      <Styled.Timeline $active={isActive} $onlyCurrent={onlyCurrent} />

      <Styled.Content $onlyCurrent={onlyCurrent}>
        <Styled.ContentTitle>{renderContentTitle()}</Styled.ContentTitle>
        {!onlyCurrent && (
          <Styled.ContentAuthor>
            {t('viewer.revision.by')} {revision.lastModifyingUser.displayName || ''}
          </Styled.ContentAuthor>
        )}
      </Styled.Content>

      {!isCurrentVersion && (
        <Styled.ContentButton>
          <Button size="md" variant="text" onClick={(event) => onRestore({ event, revisionId: revision._id })}>
            {t('viewer.restoreOriginalVersionModal.confirm')}
          </Button>
        </Styled.ContentButton>
      )}
    </Styled.RevisionItem>
  );
};

export default RevisionItem;
