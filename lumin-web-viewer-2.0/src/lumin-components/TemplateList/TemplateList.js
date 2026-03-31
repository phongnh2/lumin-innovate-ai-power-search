import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useMatch } from 'react-router';
import { compose } from 'redux';

import TemplateContext from 'screens/Templates/context';

import TemplateGridContainer from 'lumin-components/TemplateGridContainer';
import TemplatesHeader from 'lumin-components/TemplatesHeader';
import TemplateTab from 'lumin-components/TemplateTab';

import withUploadHandler from 'HOC/withUploadHandler';

import { ROUTE_MATCH } from 'constants/Routers';

import withUploadTemplateProcess from './HOC/withUploadTemplateProcess';

import * as Styled from './TemplateList.styled';

function TemplateList({
  templates,
  loading,
  pagination,
  onListChanged,
}) {
  const isOrg = Boolean(useMatch(ROUTE_MATCH.ORGANIZATION));
  const { focusing, searchText } = useContext(TemplateContext);

  return (
    <Styled.Container $isOrgPage={isOrg}>
      <TemplatesHeader />
      {!focusing && !searchText && <TemplateTab loading={loading} />}
      <TemplateGridContainer
        onListChanged={onListChanged}
        templates={templates}
        loading={loading}
        pagination={pagination}
      />
    </Styled.Container>
  );
}

TemplateList.propTypes = {
  templates: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  pagination: PropTypes.object.isRequired,
  onListChanged: PropTypes.func.isRequired,
};
TemplateList.defaultProps = {
  templates: [],
};

export default compose(
  withUploadTemplateProcess,
  withUploadHandler,
  React.memo,
)(TemplateList);
