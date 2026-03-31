import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import DocumentQuery from 'luminComponents/DocumentQuery';

import { useBaseQuery } from 'hooks';

const withQuery = (Component) => (props) => {
  const dispatch = useDispatch();

  const { isFocusing, searchKey, findDocumentByName } = useSelector(selectors.getPageSearchData);

  const baseDocumentQuery = useBaseQuery({ searchKey });
  const extendedProps = useMemo(
    () => ({
      searchKey,
      isFocusing,
      setSearchKey: (value) => dispatch(actions.setSearchKeyPageSearch(value)),
      setFocusing: (value) => dispatch(actions.setFocusingPageSearch(value)),
    }),
    [isFocusing, searchKey]
  );
  return (
    <DocumentQuery
      baseQueryDocuments={baseDocumentQuery}
      isSearchView={isFocusing || Boolean(searchKey)}
      searchKey={searchKey}
      findDocumentByName={findDocumentByName}
    >
      {(queryProps) => <Component {...props} {...extendedProps} queryProps={queryProps} />}
    </DocumentQuery>
  );
};

withQuery.propTypes = {};

export default withQuery;
