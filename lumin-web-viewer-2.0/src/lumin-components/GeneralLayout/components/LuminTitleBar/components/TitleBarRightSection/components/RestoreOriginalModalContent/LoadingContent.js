import React from 'react';

import CircularProgress from 'lumin-components/GeneralLayout/general-components/CircularProgress';

import { useTranslation } from 'hooks';

import * as Styled from './RestoreOriginalModalContent.styled';

const LoadingContent = () => {
  const { t } = useTranslation();
  return (
    <Styled.LoadingContentWrapper>
      <CircularProgress size={48} />
      <Styled.LoadingContent>{t('generalLayout.status.restoringYourFile')}</Styled.LoadingContent>
    </Styled.LoadingContentWrapper>
  );
};

export default LoadingContent;
