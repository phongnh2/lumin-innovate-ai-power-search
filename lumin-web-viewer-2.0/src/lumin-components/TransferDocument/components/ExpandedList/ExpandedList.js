import React from 'react';
import PropTypes from 'prop-types';

import TransferDocument from '../../TransferDocumentLibrary';

const ExpandedList = ({
  initialDestination,
  breadcrumb,
  navigateTo,
  search,
  expandedList,
  expandedStatus,
  data,
  setData,
  isMultipleFile,
  isMoveModal,
}) => {
  const moveDocumentProps = {
    disabledValue: initialDestination.id,
    isMultipleFile,
  };

  return (
    <>
      {Boolean(breadcrumb.length) && (
        <TransferDocument.BreadCrumbs breadcrumb={breadcrumb} onNavigate={navigateTo} search={search} />
      )}
      <TransferDocument.ExpandedList
        value={data.destination.id}
        onChange={(newVal) => setData({ ...data, destination: newVal })}
        onNavigate={navigateTo}
        isBreadcrumbExists={breadcrumb.length > 1}
        search={search}
        expandedList={expandedList}
        expandedStatus={expandedStatus}
        {...(isMoveModal && moveDocumentProps)}
      />
    </>
  );
};

ExpandedList.propTypes = {
  initialDestination: PropTypes.object,
  breadcrumb: PropTypes.array,
  navigateTo: PropTypes.func,
  search: PropTypes.object,
  expandedList: PropTypes.array,
  expandedStatus: PropTypes.object,
  data: PropTypes.object,
  setData: PropTypes.func,
  isMultipleFile: PropTypes.bool,
  isMoveModal: PropTypes.bool,
};

ExpandedList.defaultProps = {
  initialDestination: {},
  breadcrumb: [],
  navigateTo: () => {},
  search: {},
  expandedList: [],
  expandedStatus: {},
  data: {},
  setData: () => {},
  isMultipleFile: false,
  isMoveModal: false,
};

export default ExpandedList;
