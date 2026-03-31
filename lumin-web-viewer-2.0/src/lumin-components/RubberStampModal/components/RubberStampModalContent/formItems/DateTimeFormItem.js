import React, { useContext } from 'react';

import DateFormatSelect from 'lumin-components/DateFormatSelect';

import { dateFormats, timeFormats } from '../constants';
import { RubberStampModalContentContext } from '../RubberStampModalContent';

import * as Styled from './DateTimeFormItem.styled';

const DateTimeFormItem = () => {
  const { formData } = useContext(RubberStampModalContentContext);
  const { dateFormat, setDateFormat, timeFormat, setTimeFormat } = formData;

  const onDateFormatChange = (args) => {
    setDateFormat(args);
  };

  const onTimeFormatChange = (args) => {
    setTimeFormat(args);
  };
  return (
    <Styled.FormItem data-new-layout>
      <DateFormatSelect data={dateFormats} onChange={onDateFormatChange} value={dateFormat} icon="calendar" />
      <DateFormatSelect data={timeFormats} onChange={onTimeFormatChange} value={timeFormat} icon="clock" />
    </Styled.FormItem>
  );
};

export default DateTimeFormItem;
