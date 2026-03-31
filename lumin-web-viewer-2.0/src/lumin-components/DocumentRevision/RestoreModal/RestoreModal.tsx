import { CircularProgress } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import selectors from 'selectors';

import SvgElement from 'lumin-components/SvgElement';

import { useShallowSelector } from 'hooks/useShallowSelector';

import dateUtil from 'utils/date';

import { documentStorage } from 'constants/documentConstants';

import * as Styled from './RestoreModal.styled';

interface IRestoreModal {
  loading: boolean;
  revisionModifiedTime: number;
}

const RestoreModal = (props: IRestoreModal) => {
  const { loading, revisionModifiedTime } = props;
  const { t } = useTranslation();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const isDriveStorage = currentDocument.service === documentStorage.google;
  const getRestoreDescriptionKey = () => {
    if (isDriveStorage) {
      return 'viewer.revision.googleStorage.restoreDescription';
    }

    return 'viewer.revision.luminStorage.restoreDescription';
  };

  return loading ? (
    <Styled.LoadingContentWrapper>
      <CircularProgress size="lg" />
      <Styled.LoadingContent>{t('generalLayout.status.restoringYourFile')}</Styled.LoadingContent>
    </Styled.LoadingContentWrapper>
  ) : (
    <Styled.Wrapper>
      <SvgElement content="new-warning" width={48} height={48} />
      <Styled.Title>{t('viewer.restoreOriginalVersionModal.title')}</Styled.Title>
      <Styled.Msg>
        {t(getRestoreDescriptionKey(), { time: dateUtil.formatFullDate(new Date(revisionModifiedTime)) })}
      </Styled.Msg>
    </Styled.Wrapper>
  );
};

export default RestoreModal;
