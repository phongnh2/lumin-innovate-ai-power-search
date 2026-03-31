import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback, useRef } from 'react';

import TopPopup from 'lumin-components/TopPopup/TopPopup';
import { BottomPopup } from 'luminComponents/ReskinLayout/components/BottomPopup';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { TIME_TOGGLE } from 'constants/documentConstants';

const propTypes = {
  name: PropTypes.string,
  countMoveDocument: PropTypes.number,
  toggle: PropTypes.bool,
};
const defaultProps = {
  name: '',
  countMoveDocument: 0,
  toggle: false,
};

function DragMoveDocument({
  name, countMoveDocument, toggle,
}) {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const prevNameRef = useRef(null);
  const [isOpen, setOpen] = useState(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceToggle = useCallback(debounce((open) => {
    setOpen(open);
  }, TIME_TOGGLE), []);

  const handleToggle = useCallback(() => {
    if (name) {
      prevNameRef.current = name;
    }
    if (!isOpen && name && countMoveDocument && toggle) {
      setOpen(true);
      return;
    }
    if (isOpen && !toggle) {
      setOpen(false);
      return;
    }
    debounceToggle(Boolean(name));
  }, [isOpen, name, toggle, debounceToggle]);

  useEffect(() => {
    handleToggle();
  }, [handleToggle]);

  const entityName = name || prevNameRef.current || '';
  if (isEnableReskin) {
    return (
      <BottomPopup
        isOpen={isOpen}
        text={
          countMoveDocument === 1
            ? t('modalMove.movingFile', { countMoveDocument, entityName })
            : t('modalMove.movingFiles', { countMoveDocument, entityName })
        }
        iconType="move-lg"
      />
    );
  }

  return (
    <TopPopup
      isOpen={isOpen}
      text={
        countMoveDocument === 1
          ? t('modalMove.movingFile', { countMoveDocument, entityName })
          : t('modalMove.movingFiles', { countMoveDocument, entityName })
      }
    />
  );
}

DragMoveDocument.propTypes = propTypes;
DragMoveDocument.defaultProps = defaultProps;

export default DragMoveDocument;
