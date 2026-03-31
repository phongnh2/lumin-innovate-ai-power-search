import React from 'react';

import IconButton from '@new-ui/general-components/IconButton';

import * as styles from './RubberStampDumb.v2.styled';

interface RubberStampDumbProps {
  isDisabled: boolean;
  dummySrc: string;
  rubberStamp: {
    _id: string;
    property: {
      title: string;
    };
  };
  onRemoveBtnClick: (id: string) => void;
  isDragging?: boolean;
  onClick: () => void;
}

const RubberStampDumb = ({
  isDisabled,
  dummySrc,
  rubberStamp,
  onRemoveBtnClick,
  isDragging,
  onClick,
}: RubberStampDumbProps) => {
  const onRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRemoveBtnClick(rubberStamp._id);
  };
  return (
    <div
      css={styles.itemContainer}
      data-disabled={isDisabled}
      data-dragging={isDragging}
      data-cy="rubber_stamp_dumb_item"
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <img css={styles.image} src={dummySrc} alt={rubberStamp.property.title} />
      <IconButton
        size="small"
        css={styles.icon}
        className="rubber-stamp-remove-btn"
        icon="cancel"
        iconSize={12}
        onClick={onRemove}
      />
    </div>
  );
};

export default RubberStampDumb;
