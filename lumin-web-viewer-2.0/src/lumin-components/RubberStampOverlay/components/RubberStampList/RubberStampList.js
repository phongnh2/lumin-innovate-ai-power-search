import { Button, Icomoon } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { RUBBER_STAMPS_MAXIMUM } from 'lumin-components/RubberStampOverlay/constants';

import { useTranslation } from 'hooks/useTranslation';

import { getUserAnnotations } from 'services/graphServices/userAnnotation';

import logger from 'helpers/logger';

import DATA_ELEMENT from 'constants/dataElement';
import { DOCUMENT_ANNOTATION_TYPE } from 'constants/documentConstants';
import { LOGGER } from 'constants/lumin-common';

import RubberStampListContent from '../RubberStampListContent';

import styles from './RubberStampList.module.scss';

const PAGE_SIZE = 5;

const createNewStampKey = 'viewer.stamp.createNewStamp';

const RubberStampList = ({
  openElement,
  closeElements,
  setRubberStamps,
  shouldFetchMoreRubberStamps,
  rubberStampsLength,
  rubberStampsTotal,
  setShouldFetchRubberStampOnInit,
  shouldFetchOnInit,
  closePopper,
}) => {
  const hasReachedLimitation = rubberStampsTotal >= RUBBER_STAMPS_MAXIMUM;
  const scrollContainer = useRef(null);
  const scrollInner = useRef(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const openRubberStampModal = () => {
    closeElements(DATA_ELEMENT.RUBBER_STAMP_OVERLAY);
    closePopper();
    openElement(DATA_ELEMENT.RUBBER_STAMP_MODAL);
  };

  const handleGetRubberStamps = useCallback(async (skip) => {
    try {
      const { data } = await getUserAnnotations({
        limit: PAGE_SIZE,
        skip,
        type: DOCUMENT_ANNOTATION_TYPE.RUBBER_STAMP,
      });
      setRubberStamps(data.getUserAnnotations);
    } catch (e) {
      logger.logError({
        reason: LOGGER.Service.COMMON_ERROR,
        error: e,
      });
    } finally {
      setLoading(false);
      setShouldFetchRubberStampOnInit(false);
    }
  }, []);

  const handleScroll = () => {
    if (
      !scrollContainer.current ||
      scrollContainer.current.scrollTop + scrollContainer.current.clientHeight !==
        scrollContainer.current.scrollHeight ||
      !shouldFetchMoreRubberStamps ||
      loading
    ) {
      return;
    }

    handleGetRubberStamps(Math.floor(rubberStampsLength));
  };

  const renderReachLimitMessage = () => {
    if (hasReachedLimitation) {
      return (
        <span className={styles.errorMessage}>{t('viewer.stamp.reachedLimit', { count: RUBBER_STAMPS_MAXIMUM })}</span>
      );
    }
    return null;
  };

  useEffect(() => {
    if (shouldFetchOnInit) {
      handleGetRubberStamps(0);
    } else {
      setLoading(false);
    }
  }, [shouldFetchOnInit]);

  useEffect(() => {
    scrollContainer.current?.addEventListener('scroll', handleScroll);
    return () => scrollContainer.current?.removeEventListener('scroll', handleScroll);
  }, [rubberStampsLength, shouldFetchMoreRubberStamps, loading]);

  return (
    <div className={styles.list}>
      {renderReachLimitMessage()}
      <div className={styles.scrollContainer} ref={scrollContainer}>
        <div ref={scrollInner} className={styles.scrollInner}>
          {Boolean(rubberStampsLength) && (
            <Button
              startIcon={<Icomoon type="plus-md" size={16} />}
              fullWidth
              variant="outlined"
              onClick={openRubberStampModal}
              disabled={hasReachedLimitation}
              className={styles.createStampButton}
            >
              {t(createNewStampKey)}
            </Button>
          )}
          <RubberStampListContent
            loading={loading}
            closePopper={closePopper}
            renderCreateButton={() => (
              <Button
                startIcon={<Icomoon type="plus-md" size={16} />}
                variant="tonal"
                onClick={openRubberStampModal}
                disabled={hasReachedLimitation}
              >
                {t(createNewStampKey)}
              </Button>
            )}
          />
        </div>
      </div>
    </div>
  );
};

RubberStampList.propTypes = {
  openElement: PropTypes.func,
  closeElements: PropTypes.func,
  setRubberStamps: PropTypes.func,
  setShouldFetchRubberStampOnInit: PropTypes.func,
  shouldFetchMoreRubberStamps: PropTypes.bool,
  shouldFetchOnInit: PropTypes.bool,
  rubberStampsLength: PropTypes.number,
  rubberStampsTotal: PropTypes.number,
  closePopper: PropTypes.func,
};
RubberStampList.defaultProps = {
  openElement: (f) => f,
  closeElements: (f) => f,
  setRubberStamps: (f) => f,
  setShouldFetchRubberStampOnInit: (f) => f,
  shouldFetchMoreRubberStamps: false,
  shouldFetchOnInit: false,
  rubberStampsLength: 0,
  rubberStampsTotal: 0,
  closePopper: (f) => f,
};

export default RubberStampList;
