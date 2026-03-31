import PropTypes from 'prop-types';
import React from 'react';

import Divider from 'lumin-components/GeneralLayout/general-components/Divider';
import Menu, { MenuItem } from 'lumin-components/GeneralLayout/general-components/Menu';
import Paper from 'lumin-components/GeneralLayout/general-components/Paper';

import { useTranslation } from 'hooks';

import { zoomOut, zoomIn, fitToHeight, fitToWidth } from 'helpers/zoom';

import { ZOOM_MODE } from './constants';
import { handleZoom } from './utils';
import { getShortcut } from '../../utils';

import * as Styled from './ZoomTool.styled';

export const ZoomPopperContent = ({ closePopper }) => {
  const { t } = useTranslation();
  return (
    <Paper>
      <Menu>
        <MenuItem
          onClick={() => {
            fitToWidth();
            closePopper();
          }}
        >
          {t('viewer.zoomButton.fitWidth')}
        </MenuItem>

        <MenuItem
          onClick={() => {
            fitToHeight();
            closePopper();
          }}
          renderSuffix={() => <Styled.Shortcut>{getShortcut('fitHeight')}</Styled.Shortcut>}
        >
          {t('viewer.zoomButton.fitHeight')}
        </MenuItem>

        <Divider />

        {ZOOM_MODE.map((mode) => (
          <MenuItem
            key={mode}
            onClick={() => {
              handleZoom(mode);
              closePopper();
            }}
          >
            {mode}%
          </MenuItem>
        ))}

        <Divider />

        <MenuItem onClick={zoomIn} renderSuffix={() => <Styled.Shortcut>{getShortcut('zoomIn')}</Styled.Shortcut>}>
          {t('viewer.zoomButton.zoomIn')}
        </MenuItem>

        <MenuItem onClick={zoomOut} renderSuffix={() => <Styled.Shortcut>{getShortcut('zoomOut')}</Styled.Shortcut>}>
          {t('viewer.zoomButton.zoomOut')}
        </MenuItem>
      </Menu>
    </Paper>
  );
};

ZoomPopperContent.propTypes = {
  closePopper: PropTypes.func,
};

ZoomPopperContent.defaultProps = {
  closePopper: (f) => f,
};

ZoomPopperContent.defaultProps = {};

export default ZoomPopperContent;
