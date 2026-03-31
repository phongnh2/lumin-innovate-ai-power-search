import React from 'react';

import ViewerHOC from 'screens/Viewer/ViewerHOC';

import { useClearTrackDocumentSync } from 'hooks/useClearTrackDocumentSync';

import { FetchingAnnotationsProvider } from 'features/Annotation/components/FetchingAnnotationsProvider';
import { useFetchingDocument } from 'features/Document/hooks/useFetchingDocument';

import withRouteNavigation from '../HOC/withRouteNavigation';
import { useRegisterGetMeTrackingData } from '../hooks/useRegisterGetMeTrackingData';

interface IRouteProps {
  condition: (props: any) => boolean;
  pageTitle: string;
  component: React.FunctionComponent<{
    isLoadingCore: boolean;
    fetchingDocumentError: Error;
  }>;
  noIndex: boolean;
}

interface IProps {
  route: IRouteProps;
  isLoadingCore: boolean;
}

const EditorRoute = (props: IProps): JSX.Element => {
  const { route } = props;

  useRegisterGetMeTrackingData();

  useClearTrackDocumentSync();

  const { fetchingDocumentError } = useFetchingDocument();
  return (
    <FetchingAnnotationsProvider>
      <route.component fetchingDocumentError={fetchingDocumentError} {...props} />
    </FetchingAnnotationsProvider>
  );
};

export default ViewerHOC(withRouteNavigation(EditorRoute));
