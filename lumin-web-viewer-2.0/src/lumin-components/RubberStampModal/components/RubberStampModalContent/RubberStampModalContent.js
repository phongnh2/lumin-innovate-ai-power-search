import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import Checkbox from '@new-ui/general-components/Checkbox';
import FormControlLabel from '@new-ui/general-components/FormControlLabel';
import Modal from '@new-ui/general-components/Modal';

import core from 'core';

import { RUBBER_STAMPS_MAXIMUM } from 'lumin-components/RubberStampOverlay/constants';
import { showRubberStampPreview } from 'lumin-components/RubberStampOverlay/utils';

import { useTranslation } from 'hooks/useTranslation';

import { createUserAnnotation, getUserAnnotations } from 'services/graphServices/userAnnotation';

import modalEvent, { ModalName, ModalPurpose } from 'utils/Factory/EventCollection/ModalEventCollection';

import DataElements from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { DOCUMENT_ANNOTATION_TYPE } from 'constants/documentConstants';

import { dateFormats } from './constants';
import AuthorNameFormItem from './formItems/AuthorNameFormItem';
import BackgroundColorFormItem from './formItems/BackgroundColorFormItem';
import TextStyleFormItem from './formItems/TextStyleFormItem';
import TitleFormItem from './formItems/TitleFormItem';
import RubberStampPreview from './RubberStampPreview';
import { generateSubtitle } from '../../utils';

import * as Styled from './RubberStampModalContent.styled';
import './RubberStampModalContent.scss';

const RubberStampModalContentContext = React.createContext();
const WHITE = new window.Core.Annotations.Color('#FFFFFF');
const DEFAULT_BG = new window.Core.Annotations.Color('#629769');

const initialState = {
  title: 'Sample Text',
  dateFormat: dateFormats[4],
  timeFormat: null,
  author: 'Guest',
  font: 'Helvetica',
  bold: true,
  italic: false,
  underline: false,
  strikeout: false,
  textColor: WHITE,
  color: DEFAULT_BG,
  showAuthor: false,
};

const modalEventData = {
  modalName: ModalName.RUBBER_STAMP,
  modalPurpose: ModalPurpose[ModalName.RUBBER_STAMP],
};

const RubberStampModalContent = ({
  currentUser = {},
  isPlacingMultipleRubberStamp = false,
  setPlacingMultipleRubberStamp = (f) => f,
  closeElements = (f) => f,
  rubberStamps = [],
  overrideWholeRubberStampList = (f) => f,
  rubberStampsTotal = 0,
  isOpen = false,
}) => {
  // NOTE: for default value, refer to this link:
  // https://lumin.atlassian.net/wiki/spaces/LMV/pages/1373110275/410+Rubber+Stamp
  const defaultAuthor = currentUser?.name || initialState.author;
  const [title, setTitle] = useState(initialState.title);
  // NOTE: below 4 values is for generating subtitle
  const [dateFormat, setDateFormat] = useState(initialState.dateFormat);
  const [timeFormat, setTimeFormat] = useState(initialState.timeFormat);
  const [showAuthor, setShowAuthor] = useState(initialState.showAuthor);
  const [author, setAuthor] = useState(defaultAuthor);

  const [font, setFont] = useState(initialState.font);

  const [bold, setBold] = useState(initialState.bold);
  const [italic, setItalic] = useState(initialState.italic);
  const [underline, setUnderline] = useState(initialState.underline);
  const [strikeout, setStrikeout] = useState(initialState.strikeout);

  const [color, setColor] = useState(initialState.color);
  const [textColor, setTextColor] = useState(initialState.textColor);
  const [disabledCreateBtn, setDisabledCreateBtn] = useState(false);
  const { t } = useTranslation();

  const resetState = () => {
    unstable_batchedUpdates(() => {
      setTitle(initialState.title);

      setDateFormat(initialState.dateFormat);
      setTimeFormat(initialState.timeFormat);
      setShowAuthor(initialState.showAuthor);
      setAuthor(defaultAuthor);

      setFont(initialState.font);

      setBold(initialState.bold);
      setItalic(initialState.italic);
      setUnderline(initialState.underline);
      setStrikeout(initialState.strikeout);

      setTextColor(initialState.textColor);
      setColor(initialState.color);
    });
  };

  const contextData = useMemo(
    () => ({
      formData: {
        title,
        setTitle,
        dateFormat,
        setDateFormat,
        timeFormat,
        setTimeFormat,
        font,
        setFont,
        bold,
        setBold,
        italic,
        setItalic,
        underline,
        setUnderline,
        strikeout,
        setStrikeout,
        textColor,
        setTextColor,
        color,
        setColor,
        showAuthor,
        setShowAuthor,
        author,
        setAuthor,
        setDisabledCreateBtn,
      },
    }),
    [
      title,
      setTitle,
      dateFormat,
      setDateFormat,
      timeFormat,
      setTimeFormat,
      font,
      setFont,
      bold,
      setBold,
      italic,
      setItalic,
      underline,
      setUnderline,
      strikeout,
      setStrikeout,
      textColor,
      setTextColor,
      color,
      setColor,
      showAuthor,
      setShowAuthor,
      author,
      setAuthor,
      setDisabledCreateBtn,
    ]
  );

  const onCheckboxChange = () => {
    const value = !isPlacingMultipleRubberStamp;
    setPlacingMultipleRubberStamp(value);
  };

  const renderCheckbox = () => (
        <FormControlLabel
          onChange={onCheckboxChange}
          checked={isPlacingMultipleRubberStamp}
          control={<Checkbox />}
          label={t('viewer.stamp.placeStampMultipleTimes')}
        />
      );

  const reset = () => {
    resetState();
    core.setToolMode(defaultTool);
  };

  const closeModal = () => {
    closeElements(DataElements.RUBBER_STAMP_MODAL);
    reset();
  };

  const collectedData = useMemo(
    () => ({
      title,
      subtitle: generateSubtitle(showAuthor ? author : '', dateFormat, timeFormat),
      author: showAuthor ? author : null,
      dateFormat,
      timeFormat,
      font,
      bold,
      italic,
      underline,
      strikeout,
      textColor: textColor.toHexString(),
      color: color.toHexString(),
    }),
    [title, dateFormat, timeFormat, font, bold, italic, underline, strikeout, textColor, color, author, showAuthor]
  );

  const onClickCreate = async () => {
    const { subtitle: _, ...property } = collectedData;
    await createUserAnnotation({
      type: DOCUMENT_ANNOTATION_TYPE.RUBBER_STAMP,
      property,
    });
    showRubberStampPreview(collectedData, closeModal);

    const { data } = await getUserAnnotations({
      limit: rubberStamps.length + 1,
      skip: 0,
      type: DOCUMENT_ANNOTATION_TYPE.RUBBER_STAMP,
    });
    overrideWholeRubberStampList(data.getUserAnnotations);
    modalEvent.modalConfirmation(modalEventData);
  };

  const onClickCancel = () => {
    closeModal();
    modalEvent.modalDismiss(modalEventData);
  };

  return (
    <RubberStampModalContentContext.Provider value={contextData}>
      <Modal open={isOpen} onClose={closeModal} showCloseIcon elevation={0}>
        <div>
          <Styled.Title data-cy="create_rubber_stamp_modal_title">
            <span>
              {t('viewer.stamp.addStamp')} ({rubberStampsTotal}/{RUBBER_STAMPS_MAXIMUM})
            </span>
          </Styled.Title>
          <RubberStampPreview collectedData={collectedData} />
          <TitleFormItem />
          <TextStyleFormItem />
          <BackgroundColorFormItem />
          <div />
          <AuthorNameFormItem />
          {renderCheckbox()}
          <Styled.ContentFooter data-new-layout>
            <Button size="lg" variant="outlined" onClick={onClickCancel}>
              {t('action.cancel')}
            </Button>
            <Button size="lg" variant="filled" disabled={disabledCreateBtn} onClick={onClickCreate}>
              {t('action.create')}
            </Button>
          </Styled.ContentFooter>
        </div>
      </Modal>
    </RubberStampModalContentContext.Provider>
  );
};

RubberStampModalContent.propTypes = {
  currentUser: PropTypes.object,
  isPlacingMultipleRubberStamp: PropTypes.bool,
  setPlacingMultipleRubberStamp: PropTypes.func,
  closeElements: PropTypes.func,
  rubberStamps: PropTypes.array,
  overrideWholeRubberStampList: PropTypes.func,
  rubberStampsTotal: PropTypes.number,
  /**
   * @description new layout prop
   */
  isOpen: PropTypes.bool,
};

export default RubberStampModalContent;
export { RubberStampModalContentContext };
