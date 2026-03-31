import { ArrowSquareOutIcon } from '@luminpdf/icons/dist/csr/ArrowSquareOut';
import classNames from 'classnames';
import { Avatar, MenuItemBase, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { ComponentProps, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import PdfIcon from 'assets/reskin/lumin-svgs/pdf-xl.svg';

import selectors from 'selectors';

import Loading from 'luminComponents/Loading';

import useShallowSelector from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import { DocumentViewerOpenFrom } from 'utils/Factory/EventCollection/constants/DocumentEvent';

import { closeViewerNavigation } from 'features/ViewerNavigation';

import { Routers } from 'constants/Routers';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import { useGetRecentDocumentList } from '../../hooks';
import { RecentDocumentItem } from '../../interfaces';

import styles from './DocumentHistoryList.module.scss';

type DocumentHistoryTooltipProps = ComponentProps<typeof PlainTooltip>;

const DocumentHistoryTooltip = (props: DocumentHistoryTooltipProps) => <PlainTooltip openDelay={1000} {...props} />;

const DocumentHistoryList = () => {
  const { t } = useTranslation();
  const { isLoading, data: recentDocumentList } = useGetRecentDocumentList();
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const [isHoveringIcon, setIsHoveringIcon] = useState(false);
  const dispatch = useDispatch();
  const isEmptyState = !recentDocumentList?.length && !isLoading;

  const isItemActive = (item: RecentDocumentItem) => currentDocument?._id === item._id;

  const renderEmptyState = () =>
    isEmptyState && (
      <div>
        <p className={styles.emptyText}>{t('viewer.recentDocumentList.empty')}</p>
      </div>
    );

  const renderLoadingState = () =>
    isLoading && (
      <Loading
        containerStyle={{
          paddingTop: 'var(--kiwi-spacing-2)',
        }}
        normal
      />
    );

  const renderRecentDocumentList = () => {
    if (recentDocumentList?.length) {
      return recentDocumentList.map((item) => (
        <DocumentHistoryTooltip key={item._id} content={item.name} disabled={isHoveringIcon}>
          <li>
            <MenuItemBase
              to={[Routers.VIEWER, item._id].join('/')}
              state={{
                [UrlSearchParam.OPEN_FROM]: DocumentViewerOpenFrom.NAVIGATION,
              }}
              component={Link}
              activated={isItemActive(item)}
              className={styles.item}
              onClick={() => dispatch(closeViewerNavigation())}
            >
              <Avatar
                className={classNames(styles.documentThumbnail, !item.thumbnailUrl && styles.defaultDocumentThumbnail)}
                src={item.thumbnailUrl}
                placeholder={<img src={PdfIcon} alt="default pdf icon" />}
                size="xs"
                classNames={{
                  placeholder: styles.documentThumbnailPlaceholder,
                }}
              />
              <span className={styles.itemText}>{item.name}</span>
              <PlainTooltip content={t('documentPage.openInNewTab')} position="bottom-end" offset={{ crossAxis: 20 }}>
                <div
                  className={styles.itemIcon}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(`${Routers.VIEWER}/${item._id}`, '_blank');
                  }}
                  onMouseEnter={() => setIsHoveringIcon(true)}
                  onMouseLeave={() => setIsHoveringIcon(false)}
                >
                  <ArrowSquareOutIcon size={20} color="var(--kiwi-colors-surface-on-surface)" />
                </div>
              </PlainTooltip>
            </MenuItemBase>
          </li>
        </DocumentHistoryTooltip>
      ));
    }
    return null;
  };

  return (
    <div className={styles.container} data-cy="document_history_list" data-empty={isEmptyState}>
      <h2 className={styles.title}>{t('viewer.recentDocumentList.title')}</h2>
      {renderLoadingState()}
      {renderEmptyState()}
      <ul className={styles.list}>{renderRecentDocumentList()}</ul>
    </div>
  );
};

export default DocumentHistoryList;
