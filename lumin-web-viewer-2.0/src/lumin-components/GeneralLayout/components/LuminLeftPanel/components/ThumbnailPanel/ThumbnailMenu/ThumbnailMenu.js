import isBoolean from 'lodash/isBoolean';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { connect, useSelector } from 'react-redux';

import selectors from 'selectors';

import IconButton from 'luminComponents/GeneralLayout/general-components/IconButton';
import Popper from 'luminComponents/GeneralLayout/general-components/Popper';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { CLICK_ACTION_EVENT_MAPPING } from '../constants';
import usePagetoolActionFromThumbnail from '../hooks/usePagetoolActionFromThumbnail';
import * as Styled from '../ThumbnailPanel.styled';

const PopperContent = lazyWithRetry(() => import(/* webpackPrefetch: true */ './PopperContent'));

const ThumbnailMenuContext = React.createContext();

const ThumbnailMenu = ({ popperVisible, onClickAway: onClickAwayFromProps, index, isThumbnailActive }) => {
  const isAnnotationsLoaded = useSelector(selectors.getAnnotationsLoaded);
  const anchorEl = useRef(null);
  const [visible, setVisible] = useState(false);
  const { handleSendClickEvent } = usePagetoolActionFromThumbnail();

  const handleClose = useCallback(
    (e) => {
      setVisible(false);
      onClickAwayFromProps(e);
    },
    [onClickAwayFromProps]
  );

  const visibleValue = useMemo(() => {
    if (isBoolean(popperVisible)) {
      return popperVisible;
    }
    return visible;
  }, [popperVisible, visible]);

  const contextValue = useMemo(() => ({ handleClose, index }), [handleClose, index]);

  const onClick = () => {
    !visible && handleSendClickEvent(CLICK_ACTION_EVENT_MAPPING.openThumbnailmenu);
    setVisible(true);
  };

  if (!isAnnotationsLoaded) {
    return null;
  }

  return (
    <>
      <Styled.ThumbnailOverlayMenu $isThumbnailActive={isThumbnailActive}>
        <IconButton
          onClick={onClick}
          className="menu-btn"
          icon="md_more_horizontal_menu"
          iconSize={24}
          ref={anchorEl}
        />
      </Styled.ThumbnailOverlayMenu>

      <ThumbnailMenuContext.Provider value={contextValue}>
        <Popper
          open={visibleValue}
          anchorEl={anchorEl.current}
          onClose={handleClose}
          placement="right"
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
          ]}
        >
          <div style={{ minHeight: 290 }}>
            <PopperContent />
          </div>
        </Popper>
      </ThumbnailMenuContext.Provider>
    </>
  );
};

ThumbnailMenu.propTypes = {
  popperVisible: PropTypes.bool,
  onClickAway: PropTypes.func,
  isThumbnailActive: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
};

ThumbnailMenu.defaultProps = {
  popperVisible: null,
  onClickAway: (f) => f,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ThumbnailMenu);
export { ThumbnailMenuContext };
