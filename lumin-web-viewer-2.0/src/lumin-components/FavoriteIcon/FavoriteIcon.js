import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import LuminButton from 'luminComponents/LuminButton';
import Tooltip from 'luminComponents/Shared/Tooltip';

import { systemFileHandler } from 'HOC/OfflineStorageHOC';

import { useTranslation } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import documentGraphServices from 'services/graphServices/documentGraphServices';

import { STORAGE_TYPE, THEME_MODE } from 'constants/lumin-common';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { Colors } from 'constants/styles';

import { socket } from '../../socket';
import './FavoriteIcon.scss';

const propTypes = {
  document: PropTypes.object,
  currentUser: PropTypes.object,
  className: PropTypes.string,
  callback: PropTypes.func,
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)),
  disabled: PropTypes.bool,
};

const defaultProps = {
  document: {},
  currentUser: {},
  className: '',
  callback: () => {},
  themeMode: 'light',
  disabled: false,
};

const FavoriteIcon = (props) => {
  const {
    document,
    currentUser,
    className,
    callback,
    themeMode,
    disabled,
  } = props;
  const combineDisabled = disabled || document.service === STORAGE_TYPE.CACHING;
  const isSystemFile = document.service === STORAGE_TYPE.SYSTEM;
  const { isViewer } = useViewerMatch();
  const theme = isViewer ? themeMode : THEME_MODE.LIGHT;
  const { t } = useTranslation();

  let isStarred;

  if (isSystemFile) {
    isStarred = document.isStarred;
  } else {
    isStarred = document.listUserStar && document.listUserStar.includes(currentUser._id);
  }

  const starColor = () => {
    if (!isStarred) {
      return ({
        [THEME_MODE.LIGHT]: Colors.NEUTRAL_60,
        [THEME_MODE.DARK]: Colors.NEUTRAL_40,
      }[theme]);
    }
    return Colors.WARNING_50;
  };
  const toolTipContent = isStarred ? t('documentPage.removeFromStarred') : t('documentPage.addToStarred');
  const starIcon = isStarred ? 'star-filled' : 'star-empty';

  const _handleClickStar = async (e) => {
    e.stopPropagation();
    if (!currentUser || combineDisabled) {
      return;
    }

    if (isSystemFile) {
      systemFileHandler.starFile({ documentId: document._id, isStarred: !document.isStarred });
      return;
    }
    const clientId = currentUser._id;
    documentGraphServices.starDocumentMutation({
      document, currentUser, clientId, callback,
    });
    socket.emit(SOCKET_EMIT.UPDATE_DOCUMENT, { roomId: document._id, type: 'star' });
  };

  return (
    <div className={classNames('FavoriteIcon', {
      'FavoriteIcon--disabled': combineDisabled,
    })}
    >
      <Tooltip
        title={toolTipContent}
        disableHoverListener={combineDisabled}
      >
        <LuminButton
          className={classNames('FavoriteIcon__button', className, {
            'FavoriteIcon__button--active': isStarred,
            'FavoriteIcon__button--disabled': combineDisabled,
          })}
          square
          isIconButton
          icon={starIcon}
          iconSize={17}
          iconColor={starColor()}
          onClick={_handleClickStar}
        />
      </Tooltip>
    </div>
  );
};
FavoriteIcon.propTypes = propTypes;
FavoriteIcon.defaultProps = defaultProps;

export default FavoriteIcon;
