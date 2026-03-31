import PropTypes from 'prop-types';
import React, { useRef, useEffect } from 'react';

import 'constants/pikaday.scss';
import './pikaday.scss';

const DatePicker = ({ onClick, annotation, onDatePickerShow }) => {
  const dateRef = useRef(null);
  const dateContainerRef = useRef(null);
  useEffect(() => {
    let datePicker;
    const getDatePicker = async () => {
      datePicker = await window.Core.createDatePicker({
        field: dateRef.current,
        onClick,
        container: dateContainerRef.current,
        format: annotation.getDateFormat(),
      });
      onDatePickerShow(true);
    };
    getDatePicker();

    return () => {
      datePicker?.destroy();
      datePicker = null;
      onDatePickerShow(false);
    };
  }, []);
  return (
    <div data-element="datePickerContainer" className="lumin-date-picker">
      <div ref={dateRef} />
      <div ref={dateContainerRef} />
    </div>
  );
};

DatePicker.propTypes = {
  onClick: PropTypes.func.isRequired,
  annotation: PropTypes.object.isRequired,
  onDatePickerShow: PropTypes.func.isRequired,
};

export default DatePicker;
