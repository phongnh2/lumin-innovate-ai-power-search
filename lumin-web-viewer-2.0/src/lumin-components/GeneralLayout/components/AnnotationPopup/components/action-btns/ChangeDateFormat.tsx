import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Icomoon, Menu, MenuItem as KiwiMenuItem } from 'lumin-ui/kiwi-ui';
import React, { useContext, useMemo } from 'react';

import { MenuItem } from '@new-ui/general-components/Menu';

import core from 'core';

import { useTranslation } from 'hooks/useTranslation';

import setFitFreeText from 'helpers/setFitFreeText';

import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { TOOLS_NAME } from 'constants/toolsName';

import { AnnotationPopupContext } from '../../AnnotationPopupContext';

dayjs.extend(customParseFormat);

const formats = ['DD/MM/YYYY', 'YYYY/MM/DD', 'DD MMM YYYY', 'MMMM DD, YYYY', 'MMM DD YYYY'];

const ChangeDateFormat = ({
  onClick,
  onClose,
  open,
}: {
  popperRef: HTMLElement;
  open: boolean;
  onClick: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const { annotation } = useContext(AnnotationPopupContext);
  const annot = annotation as unknown as Core.Annotations.FreeTextAnnotation;
  const date = annot.getContents();
  const dateFormat = annot.getDateFormat();

  const onClickFormat = (value: string, format: string) => {
    annot.setDateFormat(format);
    annot.setContents(value);
    (core.getTool(TOOLS_NAME.DATE_FREE_TEXT) as Core.Tools.DateFreeTextCreateTool).setDateFormat(format);
    const annotManager = core.getAnnotationManager();
    setFitFreeText(annot);
    annotManager.trigger('annotationChanged', [[annot], ANNOTATION_ACTION.MODIFY, {}]);
    onClose();
  };

  const options = useMemo(
    () =>
      formats.map((format) => ({
        label: dayjs(date, dateFormat, 'en').format(format),
        value: format,
      })),
    [date, dateFormat]
  );
  return (
    <Menu
      ComponentTarget={
        <KiwiMenuItem
          leftSection={<Icomoon size="md" type="calendar-list-lg" />}
          onClick={onClick}
          rightSection={<Icomoon size="md" type="caret-right-filled-lg" />}
        >
          {t('viewer.dateStamp.changeDateFormat')}
        </KiwiMenuItem>
      }
      offset={16}
      position="right-start"
      opened={open}
      withinPortal={false}
      styles={{ dropdown: { minWidth: 248 } }}
    >
      {options.map(({ label, value }) => (
        <MenuItem
          key={value}
          activated={value === annot.getDateFormat()}
          displayCheckIcon
          hideIcon={value !== annot.getDateFormat()}
          onClick={() => onClickFormat(label, value)}
        >
          {label}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default ChangeDateFormat;
