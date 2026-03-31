import PropTypes from 'prop-types';
import React from 'react';

import ButtonLumin from 'luminComponents/ViewerCommon/ButtonLumin';

const RubberStampDumb = ({ isDisabled, dummySrc, rubberStamp, onClick, onRemoveBtnClick, isDragging }) => {
  const onRemove = (e) => {
    e.stopPropagation();
    onRemoveBtnClick(rubberStamp._id);
  };
  return (
    <div
      onClick={onClick}
      className="rubber-stamp-item"
      disabled={isDisabled}
      data-dragging={isDragging}
      role="button"
      tabIndex={0}
    >
      <img
        className="rubber-stamp-item--img"
        data-cy="rubber_stamp_item_image"
        src={dummySrc}
        alt={rubberStamp.property.title}
      />
      <ButtonLumin
        data-cy="remove_rubber_stamp_item"
        className="rubber-stamp-item__delete-button"
        icon="cancel"
        iconSize={12}
        onClick={onRemove}
      />
    </div>
  );
};

RubberStampDumb.propTypes = {
  rubberStamp: PropTypes.object.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  dummySrc: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  onRemoveBtnClick: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
};

export default RubberStampDumb;
