import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import tinycolor from 'tinycolor2';

import core from 'core';

import {
  getCaretCharacterOffsetWithin,
  turnOffShortcutOptions,
  turnOnShortcutOptions,
} from 'luminComponents/ContentEditPanel/utils';

import useAutoSync from 'hooks/useAutoSync';

import cleanseFontFamilyText from 'helpers/cleanseFontFamilyText';

import { EditPDFContext } from 'features/EditPDF/contexts';
import { getContentStylesOfAnnotation } from 'features/EditPDF/utils';

import { FONT_PLACEHOLDER, NEW_UI_CONTENT_EDIT_FONTS } from 'constants/contentEditTool';
import { DataElements } from 'constants/dataElement';
import { ANNOTATION_ACTION } from 'constants/documentConstants';
import { TEXT_DECORATION } from 'constants/textStyle';

const SELECTION_CHANGE_DEBOUNCE = 100;

const EditPDFProvider = (props) => {
  const { disableElements, closeElements, enableElements, children } = props;

  const [selectionMode, setSelectionMode] = useState(null);
  const [textEditProperties, setTextEditProperties] = useState({});
  const [format, setFormat] = useState({});
  const [selectedContentBox, setSelectedContentBox] = useState(null);
  const editorRef = useRef(null);
  const annotationRef = useRef(null);
  const contentBoxEditorRef = useRef(null);
  const contentEditManager = core.getContentEditManager();

  const getFormat = (range) => {
    if (!range) {
      return {};
    }
    const editorFormat = editorRef.current.getFormat(range.index, range.length);
    if (typeof editorFormat.color === 'string') {
      editorFormat.color = new window.Core.Annotations.Color(editorFormat.color);
    } else if (Array.isArray(editorFormat.color)) {
      editorFormat.color = null;
    } else if (!editorFormat.color) {
      editorFormat.color = annotationRef.current.TextColor;
    }
    return editorFormat;
  };

  const applyFormat = useCallback(
    (formatKey, colorValue) => {
      editorRef.current?.format(formatKey, colorValue);
      if (formatKey === 'color') {
        colorValue = new window.Core.Annotations.Color(colorValue);
      }
      setFormat({
        ...format,
        [formatKey]: colorValue,
      });
    },
    [format]
  );

  const getTextEditPropertiesFromPlaceHolder = async (annotation) => {
    let fontName = '';
    const isTextContentPlaceholder =
      annotation.isContentEditPlaceholder() && annotation.getContentEditType() === window.Core.ContentEdit.Types.TEXT;
    if (!isTextContentPlaceholder) {
      return {};
    }

    const contentStyles = await getContentStylesOfAnnotation(annotation);
    const { bold, italic, underline, fontColor, fontSize, textAlign, fontName: fontFamily } = contentStyles;
    const _fontFamily = cleanseFontFamilyText(fontFamily);
    const indexOfFont = NEW_UI_CONTENT_EDIT_FONTS.findIndex((font) => font.value === _fontFamily);
    if (indexOfFont === -1) {
      fontName = FONT_PLACEHOLDER;
    } else {
      fontName = NEW_UI_CONTENT_EDIT_FONTS[indexOfFont].label;
    }
    return {
      Font: fontName,
      FontSize: `${fontSize}pt`,
      TextAlign: textAlign,
      bold,
      italic,
      underline,
      color: fontColor,
    };
  };

  useAutoSync();

  useEffect(() => {
    let prevCaretPosition = null;

    const handleContentBoxSelectionChange = debounce(async ({ event }) => {
      if (contentBoxEditorRef.current && contentEditManager.isInContentEditMode()) {
        if (typeof event.target.getSelection !== 'function') {
          return;
        }
        const caretPostion = getCaretCharacterOffsetWithin(window.document.activeElement);
        const selectedString = event.target.getSelection().toString();
        if (!selectedString.trim() && caretPostion === prevCaretPosition) {
          return;
        }
        prevCaretPosition = caretPostion;
        closeElements([DataElements.ANNOTATION_POPUP]);
        const editor = contentBoxEditorRef.current;
        const attribute = await editor.getTextAttributes();

        const fontObject = {
          FontSize: `${attribute.fontSize}pt`,
          Font: attribute.fontName,
        };

        setTextEditProperties(fontObject);
        // remove the fontName attribute so that we don't override the fontName when we set the text attributes
        delete attribute.fontName;
        window.Core.ContentEdit.setTextAttributes(attribute);

        setFormat((prevFormat) => ({ ...prevFormat, ...attribute }));
      }
    }, SELECTION_CHANGE_DEBOUNCE);

    const handleContentBoxEditEnded = () => {
      contentBoxEditorRef.current = null;
      prevCaretPosition = null;
    };

    const handleContentBoxEditStarted = ({ editor }) => {
      contentBoxEditorRef.current = editor;
    };

    core.addEventListener('contentBoxEditEnded', handleContentBoxEditEnded);
    core.addEventListener('contentEditSelectionChange', handleContentBoxSelectionChange);
    core.addEventListener('contentBoxEditStarted', handleContentBoxEditStarted);

    return () => {
      handleContentBoxSelectionChange.cancel();
      core.removeEventListener('contentBoxEditEnded', handleContentBoxEditEnded);
      core.removeEventListener('contentEditSelectionChange', handleContentBoxSelectionChange);
      core.removeEventListener('contentBoxEditStarted', handleContentBoxEditStarted);
    };
  }, []);

  useEffect(() => {
    const handleContentEditModeStart = () => {
      disableElements([DataElements.TEXT_POPUP, DataElements.CONTEXT_MENU_POPUP]);
      window.Core.Annotations.FreeTextAnnotation.RichTextEditor.setEditorOptions(turnOnShortcutOptions());
    };

    const handleContentEditModeEnd = () => {
      enableElements([DataElements.TEXT_POPUP, DataElements.CONTEXT_MENU_POPUP]);
      window.Core.Annotations.FreeTextAnnotation.RichTextEditor.setEditorOptions(turnOffShortcutOptions());
      core.getAnnotationsList().forEach((annot) => {
        if (annot.TemporaryNoDelete) {
          annot.NoDelete = false;
          delete annot.TemporaryNoDelete;
        }
      });
    };

    const handleEditorBlur = () => {
      if (contentEditManager.isInContentEditMode()) {
        editorRef.current = null;
        annotationRef.current = null;
      }
    };

    const handleEditorFocus = (editor, annotation) => {
      if (
        annotation instanceof window.Core.Annotations.FreeTextAnnotation &&
        contentEditManager.isInContentEditMode()
      ) {
        editorRef.current = editor;
        annotationRef.current = annotation;
        setSelectionMode('FreeText');
        const richTextStyles = annotationRef.current.getRichTextStyle();
        const selectedTextEditProperties = textEditProperties;
        selectedTextEditProperties.italic = richTextStyles?.[0]['font-style'] === 'italic' ?? false;
        selectedTextEditProperties.bold = richTextStyles?.[0]['font-weight'] === 'bold' ?? false;
        selectedTextEditProperties.underline = ['underline', 'word'].includes(richTextStyles?.[0][TEXT_DECORATION]);
        setTextEditProperties(selectedTextEditProperties);
        closeElements([DataElements.ANNOTATION_POPUP]);
      }
    };

    const handleAnnotationSelected = (annotations, action) => {
      if (!contentEditManager.isInContentEditMode()) {
        return;
      }
      const annotation = annotations[0];
      const isFreeText =
        annotation instanceof window.Core.Annotations.FreeTextAnnotation &&
        annotation.getIntent() === window.Core.Annotations.FreeTextAnnotation.Intent.FreeText;

      if (action === ANNOTATION_ACTION.SELECTED) {
        if (isFreeText) {
          annotationRef.current = annotation;
          setSelectionMode('FreeText');
        } else if (annotation.isContentEditPlaceholder()) {
          unstable_batchedUpdates(async () => {
            setSelectedContentBox(annotation);
            const properties = await getTextEditPropertiesFromPlaceHolder(annotation);
            setFormat(properties);
            setTextEditProperties(properties);
            setSelectionMode('ContentBox');
          });
          editorRef.current = null;
          annotationRef.current = null;
        }
      } else if (action === ANNOTATION_ACTION.DESELECTED && selectedContentBox !== undefined) {
        setSelectedContentBox(null);
        if (!editorRef.current && !annotationRef.current) {
          setSelectionMode(null);
        }
      }
    };

    const handleTextChange = () => {
      if (core.getContentEditManager().isInContentEditMode()) {
        setFormat(getFormat(editorRef.current?.getSelection()));
      }
    };
    const handleSelectionChange = (range) => {
      if (range && editorRef.current && contentEditManager.isInContentEditMode()) {
        setFormat(getFormat(range));
      }
    };

    const handleEditPasswordRequired = (_passwordCheckCallback, successPasswordCallback) => {
      successPasswordCallback();
    };

    core.addEventListener('annotationSelected', handleAnnotationSelected);
    core.addEventListener('contentEditModeEnded', handleContentEditModeEnd);
    core.addEventListener('contentEditModeStarted', handleContentEditModeStart);
    core.addEventListener('contentEditPasswordRequired', handleEditPasswordRequired);
    core.addEventListener('editorFocus', handleEditorFocus);
    core.addEventListener('editorBlur', handleEditorBlur);
    core.addEventListener('editorSelectionChanged', handleSelectionChange);
    core.addEventListener('editorTextChanged', handleTextChange);

    return () => {
      core.removeEventListener('contentEditModeStarted', handleContentEditModeStart);
      core.removeEventListener('annotationSelected', handleAnnotationSelected);
      core.removeEventListener('editorBlur', handleEditorBlur);
      core.removeEventListener('contentEditModeEnded', handleContentEditModeEnd);
      core.removeEventListener('editorTextChanged', handleTextChange);
      core.removeEventListener('editorFocus', handleEditorFocus);
      core.removeEventListener('editorSelectionChanged', handleSelectionChange);
      core.removeEventListener('contentEditPasswordRequired', handleEditPasswordRequired);
    };
  }, []);

  const handleTextFormatChange = useCallback(
    (textFormat) => {
      if (selectedContentBox && !editorRef.current) {
        switch (textFormat) {
          case 'bold':
            window.Core.ContentEdit.toggleBoldContents(selectedContentBox);
            break;
          case 'italic':
            window.Core.ContentEdit.toggleItalicContents(selectedContentBox);
            break;
          case 'underline':
            window.Core.ContentEdit.toggleUnderlineContents(selectedContentBox);
            break;
          default:
            break;
        }
        setFormat((prevFormat) => ({
          ...prevFormat,
          [textFormat]: !prevFormat[textFormat],
        }));
        return;
      }

      if (editorRef.current) {
        const { index, length } = editorRef.current.getSelection();
        const currentFormat = editorRef.current.getFormat(index, length);
        applyFormat(format, !currentFormat[format]);
      }
    },
    [applyFormat, selectedContentBox, format]
  );

  const handleColorChange = useCallback(
    (color) => {
      const textColor = tinycolor(color).toHexString();
      if (selectedContentBox) {
        window.Core.ContentEdit.setTextColor(selectedContentBox, textColor);
      }
      applyFormat('color', textColor);
    },
    [selectedContentBox, applyFormat]
  );

  const handleColorChangeInOldLayout = useCallback(
    (_, color) => {
      const textColor = color?.toHexString?.() || color;
      if (selectedContentBox) {
        window.Core.ContentEdit.setTextColor(selectedContentBox, textColor);
      }
      applyFormat('color', color);
    },
    [applyFormat, selectedContentBox]
  );

  const handleFontStyleChange = useCallback(
    (property, value) => {
      if (annotationRef.current) {
        core.setAnnotationStyles(annotationRef.current, {
          [property]: value,
        });
      } else {
        setTextEditProperties({
          ...textEditProperties,
          [property]: value,
        });
      }

      if (selectedContentBox && !editorRef.current) {
        switch (property) {
          case 'FontSize':
            window.Core.ContentEdit.setContentFontSize(selectedContentBox, value);
            break;

          case 'Font':
            window.Core.ContentEdit.setContentFont(selectedContentBox, value);
            break;
          case 'TextAlign':
            window.Core.ContentEdit.alignContents(selectedContentBox, value);
            break;
          default:
            break;
        }
      }

      const conversionMap = {
        Font: 'fontName',
        FontSize: 'fontSize',
        TextAlign: 'textAlign',
      };

      window.Core.ContentEdit.setTextAttributes({ [conversionMap[property]]: value });
    },
    [textEditProperties, selectedContentBox]
  );

  const contextValue = useMemo(
    () => ({
      format,
      selectionMode,
      textEditProperties,
      handleFontStyleChange,
      handleTextFormatChange,
      handleColorChange,
    }),
    [
      format,
      selectionMode,
      textEditProperties,
      handleFontStyleChange,
      handleTextFormatChange,
      handleColorChange,
      handleColorChangeInOldLayout,
    ]
  );

  return <EditPDFContext.Provider value={contextValue}>{children}</EditPDFContext.Provider>;
};

EditPDFProvider.propTypes = {
  children: PropTypes.node.isRequired,
  disableElements: PropTypes.func.isRequired,
  closeElements: PropTypes.func.isRequired,
  enableElements: PropTypes.func.isRequired,
};

export default EditPDFProvider;
