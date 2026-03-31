import classNames from 'classnames';
import { Text } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import { useLocation } from 'react-router';

import SearchingView from 'assets/reskin/images/searching-documents.png';

import { DEFAULT_SEARCH_VIEW_TYPE } from 'luminComponents/DefaultSearchView';

import { useTranslation } from 'hooks';

import { matchPaths } from 'helpers/matchPaths';

import { ROUTE_MATCH } from 'constants/Routers';

import styles from './DefaultSearchView.module.scss';

type DefaultSearchViewProps = {
  type: string;
};

const DefaultSearchView = ({ type }: DefaultSearchViewProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  const isSharedDocumentRoute = Boolean(
    matchPaths(
      [ROUTE_MATCH.SHARED_DOCUMENTS, ROUTE_MATCH.PREMIUM_USER_PATHS.SHARED_DOCUMENTS].map((path) => ({
        path,
        end: false,
      })),
      location.pathname
    )
  );

  const defaultSearchViewData = useMemo(
    () =>
      ({
        [DEFAULT_SEARCH_VIEW_TYPE.DOCUMENT]: {
          title: t('searchDocument.document.title'),
          content: t('searchDocument.document.content'),
        },
        [DEFAULT_SEARCH_VIEW_TYPE.DOCUMENT_FOLDER]: {
          title: t('searchDocument.documentFolder.title'),
          content: t('searchDocument.documentFolder.content'),
        },
        [DEFAULT_SEARCH_VIEW_TYPE.TEMPLATE]: {
          title: t('searchDocument.template.title'),
          content: t('searchDocument.template.content'),
        },
        [DEFAULT_SEARCH_VIEW_TYPE.DEVICE]: {
          title: t('searchDocument.device.title'),
          content: t('searchDocument.device.content'),
        },
        [DEFAULT_SEARCH_VIEW_TYPE.HOME]: {
          title: t('searchDocument.home.title'),
          content: t('searchDocument.home.content'),
        },
      }[isSharedDocumentRoute ? DEFAULT_SEARCH_VIEW_TYPE.DEVICE : type]),
    [type, isSharedDocumentRoute]
  );

  return (
    <div className={classNames(styles.container, type === DEFAULT_SEARCH_VIEW_TYPE.HOME && styles.home)}>
      <img src={SearchingView} alt="Searching view" />
      <Text type="headline" size="lg" color="var(--kiwi-colors-surface-on-surface)">
        {defaultSearchViewData.title}
      </Text>
      <Text type="body" size="lg" color="var(--kiwi-colors-surface-on-surface-variant)">
        {defaultSearchViewData.content}
      </Text>
    </div>
  );
};

export default DefaultSearchView;
