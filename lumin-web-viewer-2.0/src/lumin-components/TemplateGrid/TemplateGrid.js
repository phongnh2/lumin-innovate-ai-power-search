import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { useDesktopMatch, useTabletMatch, useTranslation } from 'hooks';
import TemplateItem from 'lumin-components/TemplateItem';
import Pagination from 'lumin-components/Pagination';
import UploadTemplateDropzone from 'lumin-components/UploadTemplateDropzone';
import TemplateUploadFAB from 'lumin-components/TemplateUploadFAB';
import TemplateContext from 'screens/Templates/context';

import { Colors } from 'constants/styles';
import { PAGINATION_PAGE_SIZE, TEMPLATE_UPDATE_ACTIONS } from 'constants/templateConstant';

import TemplateLoader from './components/TemplateLoader';
import ResultCount from './components/ResultCount';
import * as Styled from './TemplateGrid.styled';

const PAGINATION_PAGE_SELECTION = PAGINATION_PAGE_SIZE.map((item) => ({
  name: item.toString(),
  value: item,
}));

function TemplateGrid({
  templates,
  loading,
  pagination,
  onListChanged,
  onPreview,
  onEdit,
  onInfo,
}) {
  const { t } = useTranslation();
  const isDesktopUp = useDesktopMatch();
  const isTabletUp = useTabletMatch();
  const { openSearchView, searchText } = useContext(TemplateContext);

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const fromEntries = pagination.offset * pagination.limit + 1;
  const toEntries = Math.min((pagination.offset + 1) * pagination.limit, pagination.total);

  return (
    <>
      <ResultCount
        total={pagination.total}
        loading={loading}
        searchText={searchText}
      />
      <TemplateLoader
        loading={loading}
        data={templates}
        openSearchView={openSearchView}
        searchText={searchText}
      >
        <Styled.Container hide={openSearchView}>
          <UploadTemplateDropzone disabled={!isDesktopUp}>
            <Styled.Grid>
              {templates.map((template) => (
                <TemplateItem
                  onListChanged={onListChanged}
                  onDeleted={(item) => onListChanged(item, TEMPLATE_UPDATE_ACTIONS.REMOVE)}
                  key={template._id}
                  template={template}
                  disabled={loading}
                  onPreview={onPreview}
                  onEdit={onEdit}
                  onInfo={onInfo}
                />
              ))}
            </Styled.Grid>
          </UploadTemplateDropzone>
          <Styled.BottomSection>
            <Styled.ShowMoreWrapper>
              <Styled.ShowMore>{t('common.show')}</Styled.ShowMore>
              <Styled.SelectPage
                disabled={loading}
                value={pagination.limit}
                items={PAGINATION_PAGE_SELECTION}
                onSelected={pagination.onLimitChange}
                arrowStyle={{
                  color: Colors.NEUTRAL_60,
                  size: 10,
                }}
              />
            </Styled.ShowMoreWrapper>
            <Styled.PaginationWrapper>
              <Pagination
                disabled={loading}
                currentPage={pagination.offset + 1}
                totalPages={totalPages}
                onPageSelected={pagination.onPageChange}
              />
            </Styled.PaginationWrapper>

            <Styled.PagingDescription>
              {t('common.showEntries', {
                fromEntries,
                toEntries,
                total: pagination.total,
              })}
            </Styled.PagingDescription>
          </Styled.BottomSection>
        </Styled.Container>
        {!isTabletUp && <TemplateUploadFAB />}
      </TemplateLoader>
    </>
  );
}

TemplateGrid.propTypes = {
  templates: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  pagination: PropTypes.exact({
    offset: PropTypes.number,
    total: PropTypes.number,
    limit: PropTypes.number,
    onPageChange: PropTypes.func,
    onLimitChange: PropTypes.func,
  }).isRequired,
  onListChanged: PropTypes.func.isRequired,
  onPreview: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onInfo: PropTypes.func.isRequired,
};
TemplateGrid.defaultProps = {
  templates: [],
};

export default React.memo(TemplateGrid);
