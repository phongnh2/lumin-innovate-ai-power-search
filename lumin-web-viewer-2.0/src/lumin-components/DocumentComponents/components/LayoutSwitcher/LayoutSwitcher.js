/* eslint-disable no-nested-ternary */
import { Text, Skeleton } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useContext, useRef } from 'react';
import { useLocation } from 'react-router';

import DocumentLayoutType from 'lumin-components/DocumentLayoutType';
import { DocumentLayoutSwitch } from 'lumin-components/ReskinLayout/components/DocumentLayoutSwitch';
import { DocumentTitle } from 'lumin-components/ReskinLayout/components/DocumentTitle';
import { UploadDropZoneContext } from 'lumin-components/UploadDropZone';
import { DocumentSearchContext } from 'luminComponents/Document/context';
import { MemberGroupAvatar } from 'luminComponents/ReskinLayout/components/DocumentTitle/components';

import { useTranslation, useEnableWebReskin } from 'hooks';

import { matchPaths } from 'helpers/matchPaths';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import { layoutType } from 'constants/documentConstants';
import { ORG_TEXT } from 'constants/organizationConstants';
import { ROUTE_MATCH } from 'constants/Routers';

import * as Styled from './LayoutSwitcher.styled';

function LayoutSwitcher({ layout, onChange, folder }) {
  const { t } = useTranslation();
  const location = useLocation();
  const ref = useRef(null);
  const top = ref.current ? ref.current.getBoundingClientRect().y : null;

  const { showHighlight } = useContext(UploadDropZoneContext);
  const { searchKey, totalFoundResults, documentLoading, folderLoading, folderListLoading } =
    useContext(DocumentSearchContext);

  const { isEnableReskin } = useEnableWebReskin();
  const { isVisible } = useChatbotStore();

  const isRouteMatch = Boolean(
    matchPaths(
      [
        ROUTE_MATCH.TEAM_DOCUMENT,
        ROUTE_MATCH.ORGANIZATION_DOCUMENTS.replace(':route', ORG_TEXT),
        ROUTE_MATCH.ORGANIZATION_FOLDER_DOCUMENT.ORGANIZATION,
        ROUTE_MATCH.ORGANIZATION_FOLDER_DOCUMENT.TEAM,
      ],
      location.pathname
    )
  );

  const isSharedDocumentRoute = Boolean(
    matchPaths(
      [ROUTE_MATCH.SHARED_DOCUMENTS, ROUTE_MATCH.PREMIUM_USER_PATHS.SHARED_DOCUMENTS].map((path) => ({
        path,
        end: false,
      })),
      location.pathname
    )
  );

  const ReskinComponents = isEnableReskin
    ? {
        Container: Styled.ContainerReskin,
      }
    : {
        Container: Styled.Container,
      };

  const renderDocumentTitle = () => {
    if (isEnableReskin) {
      const isLoading = isSharedDocumentRoute ? documentLoading : documentLoading || folderLoading || folderListLoading;
      if (searchKey.length && isLoading) {
        return <Skeleton radius="md" height={24} width={192} ml="var(--kiwi-spacing-1)" />;
      }
      return searchKey.length > 0 && totalFoundResults > 0 ? (
        <Text
          type="headline"
          size="xl"
          color="var(--kiwi-colors-surface-on-surface)"
          style={{
            marginLeft: 'var(--kiwi-spacing-1)',
          }}
        >
          {totalFoundResults} {t('searchDocument.result')}
        </Text>
      ) : (
        <DocumentTitle folder={folder} />
      );
    }
    return <Styled.Title>{t('common.documents')}</Styled.Title>;
  };

  const renderDocumentLayoutSection = () => {
    if (isEnableReskin) {
      return (
        <DocumentLayoutSwitch
          layout={layout}
          onLayoutChange={onChange}
          folder={folder}
          isSearching={!!searchKey.length}
        />
      );
    }
    return !searchKey.length && <DocumentLayoutType value={layout} onChange={onChange} />;
  };

  if (isEnableReskin) {
    return (
      <Styled.ContainerReskin $showHighlight={showHighlight} ref={ref} $top={top}>
        <Styled.WrapperReskin $isChatbotOpened={isVisible}>
          {renderDocumentTitle()}
          {renderDocumentLayoutSection()}
        </Styled.WrapperReskin>
        {isRouteMatch && <MemberGroupAvatar />}
      </Styled.ContainerReskin>
    );
  }

  return (
    <ReskinComponents.Container $showHighlight={showHighlight} ref={ref} $top={top} $isChatbotOpened={isVisible}>
      {renderDocumentTitle()}
      {renderDocumentLayoutSection()}
    </ReskinComponents.Container>
  );
}
LayoutSwitcher.propTypes = {
  folder: PropTypes.object,
  layout: PropTypes.oneOf(Object.values(layoutType)).isRequired,
  onChange: PropTypes.func.isRequired,
};
LayoutSwitcher.defaultProps = {
  folder: null,
};

export default React.memo(LayoutSwitcher);
