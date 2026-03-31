/* eslint-disable @typescript-eslint/no-unsafe-call */
import PropTypes from 'prop-types';
import React, { useRef, useEffect } from 'react';

import { DataElements } from 'constants/dataElement';

import { DatePickerWrapper } from './DatePicker.styled';

type DatePickerInput = {
  onClick: (text: string) => void;
  annotation: Core.Annotations.FreeTextAnnotation;
  onDatePickerShow: (show: boolean) => void;
};

const DatePicker = ({ onClick, annotation, onDatePickerShow }: DatePickerInput) => {
  const dateRef = useRef<HTMLDivElement>(null);
  const dateContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let datePicker: { destroy: () => void };
    const getDatePicker = async () => {
      datePicker = await window.Core.createDatePicker({
          field: dateRef.current,
          onClick,
          container: dateContainerRef.current,
          format: annotation.getDateFormat(),
        });
      onDatePickerShow(true);
    };
    getDatePicker().catch(() => {});

    return () => {
      datePicker?.destroy();
      datePicker = null;
      onDatePickerShow(false);
    };
  }, []);

  return (
    <DatePickerWrapper data-element={DataElements.DATE_PICKER_CONTAINER}>
      <div ref={dateRef} />
      <div ref={dateContainerRef} />
    </DatePickerWrapper>
  );
};

DatePicker.propTypes = {
  onClick: PropTypes.func.isRequired,
  annotation: PropTypes.object.isRequired,
  onDatePickerShow: PropTypes.func.isRequired,
};

export default DatePicker;
