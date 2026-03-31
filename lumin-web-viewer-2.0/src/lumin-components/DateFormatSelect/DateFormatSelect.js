import classNames from 'classnames';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';

import IconButton from '@new-ui/general-components/IconButton';
import Menu, { MenuItem } from '@new-ui/general-components/Menu';
import Popper from '@new-ui/general-components/Popper';
import PopperState from '@new-ui/general-components/PopperState';

import { dateFormats } from 'luminComponents/RubberStampModal/components/RubberStampModalContent/constants';

import './DateFormatSelect.scss';

const DateFormatSelect = ({ data, onChange, value, icon }) => {
  const onItemClick = (item, callback = (f) => f) => {
    onChange(item);
    callback();
  };

  const renderItem = ({ item, closePopper, value }) => {
    const baseAttrs = {
      onClick: () => {
        onItemClick(item, closePopper);
      },
      className: classNames('date-format-select-list--item', { active: item === value }),
    };

    if (item === null) {
      return (
        <MenuItem key="null" {...baseAttrs}>
          None
        </MenuItem>
      );
    }
    return (
      <MenuItem key={item} {...baseAttrs}>
        {dayjs().format(item)}
      </MenuItem>
    );
  };

  const renderListItem = ({ closePopper }, value) => {
    const content = data.map((item) => renderItem({ item, closePopper, value }));
    return <Menu>{content}</Menu>;
  };

  return (
    <PopperState>
      {({ openPopper, closePopper, isOpen, anchorEl }) => (
        <>
          <IconButton icon={icon} onClick={openPopper} />
          <Popper anchorEl={anchorEl} open={isOpen} onClose={closePopper} placement="right-start">
            {renderListItem({ closePopper }, value)}
          </Popper>
        </>
      )}
    </PopperState>
  );
};

DateFormatSelect.propTypes = {
  data: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  icon: PropTypes.string.isRequired,
};

DateFormatSelect.defaultProps = {
  value: dateFormats[4],
};

export default DateFormatSelect;
