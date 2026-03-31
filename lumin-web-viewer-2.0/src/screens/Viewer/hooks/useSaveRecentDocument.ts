import { useEffect } from 'react';
import { useMatch } from 'react-router';

import selectors from 'selectors';

import { useIsSystemFile } from 'hooks/useIsSystemFile';
import useShallowSelector from 'hooks/useShallowSelector';

import { useSetRecentDocument } from 'features/ViewerNavigation';

import { ROUTE_MATCH } from 'constants/Routers';

export const useSaveRecentDocument = () => {
  const { _id: documentId, remoteId, name, thumbnail } = useShallowSelector(selectors.getCurrentDocument) || {};
  const { mutate: setRecentDocument } = useSetRecentDocument();
  const viewerMatched = !!useMatch({ path: ROUTE_MATCH.VIEWER, end: true });
  const { isSystemFile } = useIsSystemFile();

  useEffect(() => {
    if (!documentId || !remoteId || !viewerMatched || isSystemFile) {
      return;
    }
    setRecentDocument({
      _id: documentId,
      name,
      url: remoteId,
      thumbnailUrl: thumbnail,
    });
  }, [documentId, remoteId, viewerMatched, isSystemFile]);
};
