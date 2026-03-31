import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import { Trans } from 'react-i18next';

import TopPopup from 'lumin-components/TopPopup/TopPopup';
import { BottomPopup } from 'luminComponents/ReskinLayout/components/BottomPopup';

import { useEnableWebReskin, useIsMountedRef } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { TIME_TOGGLE } from 'constants/documentConstants';

const propTypes = {
  name: PropTypes.string,
};
const defaultProps = {
  name: '',
};

const MAX_NAME_LENGTH = 30;
function DropDocument({
  name,
}) {
  const prevNameRef = useRef(null);
  const [isOpen, setOpen] = useState(false);
  const isMounted = useIsMountedRef();
  const { isViewer } = useViewerMatch();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceToggle = useCallback(debounce((open) => {
    if (isMounted.current) {
      setOpen(open);
    }
  }, TIME_TOGGLE), []);

  const handleToggle = useCallback(() => {
    if (name) {
      prevNameRef.current = name;
    }
    if (!isOpen && name) {
      setOpen(true);
      return;
    }
    debounceToggle(Boolean(name));
  }, [isOpen, name, debounceToggle]);

  const truncateName = (text) => {
    const entityName = text.slice(0, text.lastIndexOf(' '));
    const lastWord = text.slice(text.lastIndexOf(' ') + 1);
    if (entityName.length <= MAX_NAME_LENGTH) {
      return text;
    }
    return text.length > MAX_NAME_LENGTH ? `${text.slice(0, MAX_NAME_LENGTH)}... ${lastWord}` : text;
  };

  useEffect(() => {
    if (!isViewer) {
      handleToggle();
    }
  }, [handleToggle, isViewer]);

  const entityName = name || prevNameRef.current || '';

  const { isEnableReskin } = useEnableWebReskin();

  if (isViewer) {
    return null;
  }

  if (isEnableReskin) {
    return (
      <BottomPopup
        isOpen={isOpen}
        text={<Trans i18nKey="documentPage.reskin.uploadDocument.dropHereTo" values={{ name: entityName }} />}
        iconType="upload-lg"
      />
    );
  }

  return (
    <TopPopup
      isOpen={isOpen}
      text={
        <Trans i18nKey="documentPage.reskin.uploadDocument.dropHereTo" values={{ name: truncateName(entityName) }} />
      }
    />
  );
}

DropDocument.propTypes = propTypes;
DropDocument.defaultProps = defaultProps;

export default DropDocument;
