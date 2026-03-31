import classNames from 'classnames';
import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { ThemeProvider, useTheme } from 'styled-components';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';
import Icomoon from 'luminComponents/Icomoon';

import * as Styled from './Toast.styled';

export const TOAST_TYPE = {
  NEUTRAL: 'neutral',
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

const iconMapping = {
  [TOAST_TYPE.NEUTRAL]: 'success',
  [TOAST_TYPE.SUCCESS]: 'success',
  [TOAST_TYPE.WARNING]: 'exclamation-circle',
  [TOAST_TYPE.ERROR]: 'cancel-circle',
  [TOAST_TYPE.INFO]: 'info',
};

const Toast = (props) => {
  const { type, message = '', action, close, title = '' } = props;

  const { themeMode } = useTheme();

  const renderToastMessage = () => (
    <>
      {title && <Styled.Title>{title}</Styled.Title>}
      {message && <Styled.Message>{message}</Styled.Message>}
    </>
  );

  const onActionButtonClick = () => {
    action.callback();
    close();
  };

  const renderAction = () => (
    <Button className="action-btn" variant="outlined" onClick={onActionButtonClick} style={{ zIndex: 1 }}>
      {action.label}
    </Button>
  );

  const themeProvider = Styled.toastTheme[themeMode];

  return (
    <ThemeProvider theme={themeProvider}>
      <Styled.ToastContainer type={type}>
        <Styled.Icon $message={message}>
          <Icomoon className={classNames(iconMapping[type])} size={20} />
        </Styled.Icon>

        <Styled.ToastMessageContainer $singleElement={!!title === !message} $message={message}>
          {renderToastMessage()}
        </Styled.ToastMessageContainer>

        {action && renderAction()}
        <IconButton className="close-btn" iconSize={24} icon="md_close" onClick={() => {}} />
      </Styled.ToastContainer>
    </ThemeProvider>
  );
};

Toast.propTypes = {
  type: PropTypes.oneOf(Object.values(TOAST_TYPE)).isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  title: PropTypes.string,
  action: PropTypes.shape({
    label: PropTypes.string,
    callback: PropTypes.func,
  }),
  close: PropTypes.func.isRequired,
};

export default Toast;
