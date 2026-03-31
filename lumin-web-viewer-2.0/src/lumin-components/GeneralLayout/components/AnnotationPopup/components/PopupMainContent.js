import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import AddOutline from '@new-ui/components/TextPopup/components/AddOutline';
import Divider from '@new-ui/general-components/Divider';
import Popper from '@new-ui/general-components/Popper';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';
import ColorPaletteLumin from 'luminComponents/ColorPaletteLumin';

import getAnnotationStyles from 'helpers/getAnnotationStyles';
import setToolStyles from 'helpers/setToolStyles';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { DataElements } from 'constants/dataElement';
import { TOOLS_NAME } from 'constants/toolsName';

import AddNote from './action-btns/AddNote';
import BringToBackOrFront from './action-btns/BringToBackOrFront';
import Calendar from './action-btns/Calendar';
import ChangeFormFieldType from './action-btns/ChangeFormFieldType/ChangeFormFieldType';
import EditStyle from './action-btns/EditStyle';
import FontSizeGroupButton from './action-btns/FontSizeGroupButton';
import LinkBtn from './action-btns/LinkBtn';
import MoreOptions from './action-btns/MoreOptions';
import Navigate from './action-btns/Navigate';
import Redact from './action-btns/Redact';
import Remove from './action-btns/Remove';
import TextColor from './action-btns/TextColor';
import * as Styled from '../AnnotationPopup.styled';
import { AnnotationPopupContext } from '../AnnotationPopupContext';
import useAnnotationPopupAction from '../hooks/useAnnotationPopupAction';

export const textToolPopperOffset = {
  horizontal: -8,
  vertical: 4,
};

const PopupMainContent = () => {
  const { editText } = useAnnotationPopupAction();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const anchorRef = useRef(null);

  const toolbarValue = useSelector(selectors.toolbarValue);

  const multipleAnnotationsSelected = core.getSelectedAnnotations().length > 1;

  const [openMoreOptions, setOpenMoreOptions] = useState(false);

  const [openColorPalletePopper, setOpenColorPalletePopper] = useState(false);

  const [isHideColorPalettePopper, setIsHideColorPalettePopper] = useState(false);

  const { canModify, isDisabled, annotation } = useContext(AnnotationPopupContext);

  const { showNavigateButton } = useAnnotationPopupAction();

  const isFreeTextTool = annotation.ToolName === TOOLS_NAME.FREETEXT;
  const isDateFreeTextTool =
    annotation instanceof window.Core.Annotations.FreeTextAnnotation && Boolean(annotation.getDateFormat());

  const [initialStyle, setInitialStyle] = useState(getAnnotationStyles(annotation));

  const onClose = () => {
    dispatch(actions.closeElement(DataElements.ANNOTATION_POPUP));
  };

  const handleStyleChange = useCallback(
    (property, color) => {
      const emitProperty = property;
      setToolStyles(annotation.ToolName, property, color);
      setInitialStyle({
        ...initialStyle,
        [emitProperty]: color,
      });
      core.setAnnotationStyles(annotation, {
        [emitProperty]: color,
      });
    },
    [initialStyle, annotation]
  );

  const onTextColorClick = () => {
    setOpenMoreOptions(false);
    setOpenColorPalletePopper(!openColorPalletePopper);
    setIsHideColorPalettePopper(false);
  };

  const onCloseTextToolPopper = () => {
    setOpenColorPalletePopper(false);
    setIsHideColorPalettePopper(false);
  };

  const onMoreOptionsClick = () => {
    setOpenMoreOptions(true);
    onCloseTextToolPopper();
  };

  const isContentEditPlaceholder = annotation.isContentEditPlaceholder();

  const showEditTextButton =
    isContentEditPlaceholder && annotation.getContentEditType() === window.Core.ContentEdit.Types.TEXT;

  useEffect(() => {
    setOpenColorPalletePopper(false);
  }, [toolbarValue]);

  if (isDisabled || !canModify) {
    return <Navigate />;
  }

  return (
    <>
      <Styled.ContentWrapper ref={anchorRef} data-popup-name="PopupMainContent">
        {(isFreeTextTool || isDateFreeTextTool) && !multipleAnnotationsSelected ? (
          <>
            <TextColor color={initialStyle.TextColor} onClick={onTextColorClick} />
            <FontSizeGroupButton />
            {isDateFreeTextTool && (
              <>
                <Calendar />
                <Divider orientation="vertical" style={{ height: 32, margin: 0 }} />
              </>
            )}
            <Remove />
            {canModify && <Divider orientation="vertical" style={{ height: 32, margin: 0 }} />}
            <Navigate />
            {showNavigateButton && <Divider orientation="vertical" style={{ height: 32, margin: 0 }} />}
            <MoreOptions
              anchorRef={anchorRef.current}
              open={openMoreOptions}
              onClick={onMoreOptionsClick}
              onClose={() => setOpenMoreOptions(false)}
            />
          </>
        ) : (
          <>
            <BringToBackOrFront />
            <AddNote />
            <Calendar />
            {/* NOTE: edit pdf */}
            {showEditTextButton && (
              <IconButton
                dataElement="annotationContentEditButton"
                icon="md_edit"
                tooltipData={{ title: t('annotation.editText') }}
                onClick={editText}
                data-lumin-btn-name={ButtonName.START_EDIT_PDF_TEXT}
                iconSize={20}
              />
            )}
            <ChangeFormFieldType />
            <Redact />
            <EditStyle />
            <Remove />
            <LinkBtn />
            <Navigate />
            <AddOutline closePopup={onClose} annotation={annotation} />
          </>
        )}
      </Styled.ContentWrapper>
      <Popper
        open={openColorPalletePopper}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        modifiers={[
          {
            name: 'offset',
            options: { offset: [textToolPopperOffset.horizontal, textToolPopperOffset.vertical] },
          },
        ]}
        style={{ visibility: isHideColorPalettePopper ? 'hidden' : 'visible' }}
      >
        <Styled.ColorPaletteWrapper>
          <ColorPaletteLumin
            color={initialStyle.TextColor}
            placement="bottom-start"
            property="TextColor"
            onStyleChange={handleStyleChange}
            colorMapKey="freeText"
            anchorFreeTextTool={anchorRef.current}
            onOpenFreeTextToolChromePicker={() => setIsHideColorPalettePopper(true)}
            onCompletedFreeTextToolChromePicker={onCloseTextToolPopper}
          />
        </Styled.ColorPaletteWrapper>
      </Popper>
    </>
  );
};

PopupMainContent.propTypes = {};

export default PopupMainContent;
