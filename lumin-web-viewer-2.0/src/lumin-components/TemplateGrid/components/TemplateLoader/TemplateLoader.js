import React from 'react';
import PropTypes from 'prop-types';

import DefaultSearchView, {
  DEFAULT_SEARCH_VIEW_TYPE,
} from 'lumin-components/DefaultSearchView';
import EmptySearchResult from 'lumin-components/DocumentComponents/components/EmptySearchResult';
import UploadTemplateDropzone from 'lumin-components/UploadTemplateDropzone';
import EmptyTemplates from 'lumin-components/EmptyTemplates';
import TemplateUploadFAB from 'lumin-components/TemplateUploadFAB';

import { useDesktopMatch, useTabletMatch } from 'hooks';
import { PAGINATION_PAGE_SIZE } from 'constants/templateConstant';

import * as Styled from '../../TemplateGrid.styled';
import TemplateSkeleton from '../TemplateSkeleton';

const createSkeletons = () => Array(PAGINATION_PAGE_SIZE[0])
  .fill()
  .map((_, index) => <TemplateSkeleton key={index} />);

const TemplateLoader = (props) => {
  const {
    children, loading, data, openSearchView, searchText,
  } = props;
  const isDesktopUp = useDesktopMatch();
  const isTabletUp = useTabletMatch();
  if (openSearchView) {
    return <DefaultSearchView type={DEFAULT_SEARCH_VIEW_TYPE.TEMPLATE} />;
  }

  if (loading) {
    return <Styled.Grid>{createSkeletons()}</Styled.Grid>;
  }

  if (!data.length && !searchText) {
    return (
      <UploadTemplateDropzone disabled={!isDesktopUp}>
        <EmptyTemplates />
        {!isTabletUp && <TemplateUploadFAB />}
      </UploadTemplateDropzone>
    );
  }

  if (!data.length && searchText) {
    return <EmptySearchResult />;
  }

  return children;
};

TemplateLoader.propTypes = {
  loading: PropTypes.bool,
  data: PropTypes.array,
  children: PropTypes.node,
  openSearchView: PropTypes.func,
  searchText: PropTypes.string,
};

TemplateLoader.defaultProps = {
  loading: true,
  data: [],
  children: PropTypes.node,
  openSearchView: () => {},
  searchText: '',
};

export default React.memo(TemplateLoader);
