/* eslint-disable no-useless-escape */
/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-cycle */
/* eslint-disable arrow-body-style */
import range from 'lodash/range';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';

import actions from 'actions';

import { useTranslation } from 'hooks';

import { eventTracking } from 'utils';

import UserEventConstants from 'constants/eventConstants';

import InsertAllPage from './components/InsertAllPage';
import MergeBtns from './components/MergeBtns';
import PositionToInsert from './components/PositionToInsert';
import UploadedFileList from './components/UploadedFileList';
import { ERROR_MESSAGE_TYPE, MERGE_EVENTS, MERGE_EVENTS_PURPOSE, SELECT_VALUE } from '../../constants';
import { MergePanelContext } from '../../MergePanel';

const MergeMainViewContext = React.createContext();
const rangeRegex = /^\d+(?:-\d+)?(?:,\h*\d+(?:-\d+)?)*$/g;

export const MergeMainView = ({
  filesInfo,
  pagesInsert,
  pagePosition,
  allPages,
  pageInsertErrorMessage,
  pagePositionErrorMessage,
  loading,
  errorUploadFile,
}) => {
  const { t } = useTranslation();
  const [insertBeforeOrAfter, setInsertBeforeOrAfter] = useState(SELECT_VALUE.AFTER);

  const { setPagesInsert, setPageInsertErrorMessage, setPagePositionErrorMessage, setLoading } =
    useContext(MergePanelContext);

  const shouldCancelMerge = useRef(false);
  const mergedFilesInfo = useRef([]);

  const calculateRange = useCallback(() => {
    const pagesInsertArray = [];
    const rangeArray = pagesInsert.split(',');
    // eslint-disable-next-line no-restricted-syntax
    for (const value of rangeArray) {
      const subRangeArray = value.split('-');
      if (subRangeArray.length === 1) {
        pagesInsertArray.push(parseInt(value));
      } else {
        const subRange = range(parseInt(subRangeArray[0]), parseInt(subRangeArray[1]) + 1);
        pagesInsertArray.push(...subRange);
      }
    }
    return pagesInsertArray;
  }, [pagesInsert]);

  useEffect(() => {
    const cancelCallBack = () => {
      shouldCancelMerge.current = true;
      eventTracking(UserEventConstants.EventType.CLICK, {
        elementName: MERGE_EVENTS.CANCEL_MERGE_PROGRESS,
        elementPurpose: MERGE_EVENTS_PURPOSE[MERGE_EVENTS.CANCEL_MERGE_PROGRESS],
      });
    };

    window.addEventListener('cancelMergingProcess', cancelCallBack);

    return () => {
      window.removeEventListener('cancelMergingProcess', cancelCallBack);
    };
  }, []);

  const advancedCheck = useCallback(
    (pagesInsert) => {
      const fileInfo = filesInfo[0];
      const rangeArray = pagesInsert.split(',');
      // eslint-disable-next-line no-restricted-syntax
      for (const value of rangeArray) {
        const subRangeArray = value.split('-');
        if (subRangeArray.length === 1 && (parseInt(value) > fileInfo.totalPages || parseInt(value) === 0)) {
          setPageInsertErrorMessage(t(ERROR_MESSAGE_TYPE.OVER_TOTAL_PAGES));
          break;
        } else {
          const firstValue = parseInt(subRangeArray[0]);
          const secondValue = parseInt(subRangeArray[1]);
          if (firstValue > secondValue) {
            setPageInsertErrorMessage(t(ERROR_MESSAGE_TYPE.INVALID_PAGE_POSITION));
            break;
          }
          if (
            firstValue > fileInfo.totalPages ||
            secondValue > fileInfo.totalPages ||
            firstValue === 0 ||
            secondValue === 0
          ) {
            setPageInsertErrorMessage(t(ERROR_MESSAGE_TYPE.OVER_TOTAL_PAGES));
            break;
          }
        }
      }
    },
    [filesInfo, setPageInsertErrorMessage, t]
  );

  const validateInsertPage = useCallback(
    (value) => {
      const validation = new RegExp(rangeRegex);
      const isValid = validation.test(value);
      setPageInsertErrorMessage(isValid ? '' : t(ERROR_MESSAGE_TYPE.INVALID_PAGE_INSERT));
      setTimeout(() => {
        if (isValid) {
          advancedCheck(value);
        }
      }, 0);
    },
    [advancedCheck, setPageInsertErrorMessage, t]
  );

  const handleInputPageInsertChange = useCallback(
    (event) => {
      if (event) {
        const { value } = event.target;
        setPagesInsert(value);
        validateInsertPage(value);
      }
    },
    [setPagesInsert, validateInsertPage]
  );

  const contextValue = useMemo(
    () => ({
      insertBeforeOrAfter,
      setInsertBeforeOrAfter,
      allPages,
      pagePositionErrorMessage,
      setPagePositionErrorMessage,
      pageInsertErrorMessage,
      setPageInsertErrorMessage,
      loading,
      setLoading,
      calculateRange,
      shouldCancelMerge,
      mergedFilesInfo,
      handleInputPageInsertChange,
      filesInfo,
      pagesInsert,
      pagePosition,
      errorUploadFile,
    }),
    [
      insertBeforeOrAfter,
      setInsertBeforeOrAfter,
      allPages,
      pagePositionErrorMessage,
      setPagePositionErrorMessage,
      pageInsertErrorMessage,
      setPageInsertErrorMessage,
      loading,
      setLoading,
      calculateRange,
      shouldCancelMerge,
      mergedFilesInfo,
      handleInputPageInsertChange,
      filesInfo,
      pagesInsert,
      pagePosition,
      errorUploadFile,
    ]
  );

  return (
    <MergeMainViewContext.Provider value={contextValue}>
      <UploadedFileList />
      <InsertAllPage />
      <PositionToInsert />
      <MergeBtns />
    </MergeMainViewContext.Provider>
  );
};

MergeMainView.propTypes = {
  filesInfo: PropTypes.array.isRequired,
  pagesInsert: PropTypes.string.isRequired,
  errorUploadFile: PropTypes.string.isRequired,
  pageInsertErrorMessage: PropTypes.string.isRequired,
  pagePositionErrorMessage: PropTypes.string.isRequired,
  pagePosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  allPages: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
  openViewerModal: (modalSettings) => dispatch(actions.openViewerModal(modalSettings)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MergeMainView);
export { MergeMainViewContext };
