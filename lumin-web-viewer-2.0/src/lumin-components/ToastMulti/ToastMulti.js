import IconButton from '@mui/material/IconButton';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'lumin-components/Icomoon';

import errorExtract from 'utils/error';

import './ToastMulti.scss';

const TOAST_TYPE = {
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
  ERROR: 'error',
};

const iconMapping = {
  [TOAST_TYPE.SUCCESS]: 'success',
  [TOAST_TYPE.WARNING]: 'exclamation-circle',
  [TOAST_TYPE.ERROR]: 'cancel-circle',
  [TOAST_TYPE.INFO]: 'info',
};

ToastMulti.propTypes = {
  type: PropTypes.oneOf(Object.values(TOAST_TYPE)).isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  title: PropTypes.string,
  error: PropTypes.object,
  action: PropTypes.shape({
    label: PropTypes.string,
    callback: PropTypes.func,
  }),
  close: PropTypes.func.isRequired,
};

ToastMulti.defaultProps = {
  message: '',
  title: '',
  error: {},
  action: null,
};

function ToastMulti(props) {
  const {
    type, message, error, action, close, title
  } = props;
  const msg = errorExtract.constructRateLimitError(error, message);
  const renderToastMessage = () => {
    if (!title) {
      return (
        <span className={classNames('Toast__message', `Toast__message--${iconMapping[type]}`)}>{msg}</span>
      );
    }
    return (
        <span className={classNames('Toast__message Toast__message--with-title', `Toast__message--${iconMapping[type]}`)}>
          <strong className='title'>{title}</strong> <br/>
          <p className='description'>{msg}</p>
        </span>
      );
  };
  return (
    <div
      className={classNames('Toast__container', `Toast__container--${type}`)}
    >
      <span className="Toast__content">
        <Icomoon
          className={classNames(
            iconMapping[type],
            'Toast__icon',
            `Toast__icon--${type}`,
          )}
          size={18}
        />
        <div className="Toast__detail">{renderToastMessage()}</div>
      </span>
      {action ? (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <span
          className="Toast__action"
          onClick={() => {
            action.callback();
            close();
          }}
        >
          {action.label}
        </span>
      ) : (
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className="Toast__close-btn"
          onClick={() => {}}
        >
          <Icomoon className="cancel" size={14} />
        </IconButton>
      )}
    </div>
  );
}

export default ToastMulti;
