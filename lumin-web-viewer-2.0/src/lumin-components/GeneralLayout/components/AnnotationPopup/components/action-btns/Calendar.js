import React from 'react';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import useAnnotationPopupAction from '../../hooks/useAnnotationPopupAction';
import useAnnotationPopupBtnCondition from '../../hooks/useAnnotationPopupBtnCondition';

const Calendar = () => {
  const { toggleDatePicker } = useAnnotationPopupAction();
  const { showCalendarButton } = useAnnotationPopupBtnCondition();

  const { t } = useTranslation();

  return showCalendarButton ? (
    <IconButton
      dataElement="annotationDateEditButton"
      icon="md_date"
      iconSize={24}
      onClick={toggleDatePicker}
      tooltipData={{ location: 'bottom', title: t('documentPage.changeDate') }}
    />
  ) : null;
};

Calendar.propTypes = {};

export default Calendar;
