import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Tooltip from 'luminComponents/Shared/Tooltip';
import Icomoon from 'luminComponents/Icomoon';
import './NotificationActionButton.scss';

function NotificationActionButton({
  icon, title, onClick, isRead,
}) {
  const onActionButtonClick = (event) => {
    event.stopPropagation();
    onClick();
  };

  const btnClass = classNames('NotificationActionButton__btn', {
    'NotificationActionButton__btn--unseen': !isRead,
  });

  const renderContent = (
    <div className="NotificationActionButton">
      <button className={btnClass} onClick={onActionButtonClick}>
        <Icomoon
          className={icon}
          size={20}
        />
      </button>
    </div>
  );

  return title ? (
    <Tooltip title={title}>
      {renderContent}
    </Tooltip>
  ) : renderContent;
}

NotificationActionButton.defaultProps = {
  title: '',
  onClick: () => {},
  isRead: false,
};

NotificationActionButton.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string,
  onClick: PropTypes.func,
  isRead: PropTypes.bool,
};

export default NotificationActionButton;
