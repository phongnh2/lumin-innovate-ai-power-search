import React from 'react';
import { useSelector } from 'react-redux';

import LinearProgress from '@new-ui/general-components/LinearProgress';

import selectors from 'selectors';

import * as Styled from './DocumentLoadingBar.styled';

const DocumentLoadingBar = (): JSX.Element => {
  const isAnnotationLoaded = useSelector(selectors.getAnnotationsLoaded);
  const isNotFoundDocument = useSelector(selectors.isNotFoundDocument);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const classes = Styled.useStyles() as Record<string, string>;

  if (isAnnotationLoaded || isNotFoundDocument) {
    return null;
  }

  return (
    <Styled.LoadingBarContainer>
      <LinearProgress classes={classes} />
    </Styled.LoadingBarContainer>
  );
};

export default DocumentLoadingBar;
