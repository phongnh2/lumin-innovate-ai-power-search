import PropTypes from 'prop-types';
import React, { forwardRef, useState, memo, useMemo, useCallback, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import v4 from 'uuid/v4';

import actions from 'actions';

import Icomoon from 'lumin-components/Icomoon';
import CustomToolBar from 'lumin-components/RichTextInput/CustomToolBar';
import Tooltip from 'lumin-components/Shared/Tooltip';

import { useThemeMode, useTranslation } from 'hooks';

import { isFirefox } from 'helpers/device';

import { toolbarOptions, getModuleById, richTextIdMapping, DEFAULT_RICH_TEXT_ID } from 'constants/textStyle';

import * as Styled from './RichTextInput.styled';

const RichTextInput = forwardRef(
  (
    {
      defaultContent,
      placeholder,
      onBlur,
      onFocus,
      onKeyDown,
      onInputChange,
      readOnly,
      shouldDisableToolBar,
      shouldShowToolBar,
      shouldLimitHeight,
      annotationSubject,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const themeMode = useThemeMode();
    const [isFocusedInput, setIsFocusedInput] = useState(false);

    const onChangeRichText = (editingContent) => {
      const content = editingContent
        .replaceAll('</p><p>', '<br>&nbsp;')
        .replace(/(<p)/gim, '<span')
        .replace(/<\/p>/gim, '</span>');

      onInputChange(content);
    };

    const handleOnBlur = () => {
      setIsFocusedInput(false);
      dispatch(actions.setUnusedRichtext());
      onBlur();
    };

    const handleOnFocus = () => {
      setIsFocusedInput(true);
      dispatch(actions.setUsingRichtext());
      onFocus();
    };

    const richTextId = useMemo(() => {
      const randomId = v4();
      return `${richTextIdMapping[annotationSubject] || DEFAULT_RICH_TEXT_ID}-${randomId}`;
    }, [annotationSubject]);

    // NOTE: Dyanmic modules will cause the editor lose focus then focus again => trigger onBlur event
    const modules = useMemo(() => getModuleById(richTextId), [richTextId]);

    useEffect(
      () => () => {
        dispatch(actions.setUnusedRichtext());
      },
      []
    );

    const renderPopperContent = useCallback(
      () => (
        <Styled.ToolTipContent>
          <Trans
            i18nKey="option.richText.styleInfo"
            components={{
              b: <Styled.Bold />,
              i: <Styled.Italic />,
              u: <Styled.Underline />,
              span: <Styled.ToolTipContainer />,
            }}
          />
        </Styled.ToolTipContent>
      ),
      []
    );

    const renderInput = () => (
      <>
        <Styled.InputArea
          theme="snow"
          limitHeight={shouldLimitHeight}
          showToolBar={shouldShowToolBar}
          isFocusedInput={isFocusedInput}
          onKeyDown={onKeyDown}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          placeholder={placeholder || t('action.comment')}
          defaultValue={defaultContent}
          onChange={onChangeRichText}
          modules={modules}
          formats={toolbarOptions}
          ref={ref}
          readOnly={readOnly}
          preserveWhitespace={isFirefox}
        />
        <Styled.StyleWrapper $isFocusedInput={isFocusedInput} $shouldShowToolBar={shouldShowToolBar}>
          <CustomToolBar toolbarId={richTextId} disableToolBar={shouldDisableToolBar} />
          {isFocusedInput && (
            <Tooltip title={renderPopperContent()}>
              <Icomoon className="info" size={18} color={Styled.theme[themeMode].TOOLTIP_COLOR} />
            </Tooltip>
          )}
        </Styled.StyleWrapper>
      </>
    );

    return (
      <ThemeProvider theme={Styled.theme[themeMode]}>
        <Styled.Wrapper isFocusedInput={isFocusedInput}>{renderInput()}</Styled.Wrapper>
      </ThemeProvider>
    );
  }
);

RichTextInput.propTypes = {
  placeholder: PropTypes.string,
  onInputChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,
  readOnly: PropTypes.bool,
  defaultContent: PropTypes.string,
  shouldDisableToolBar: PropTypes.bool,
  shouldShowToolBar: PropTypes.bool,
  shouldLimitHeight: PropTypes.bool,
  annotationSubject: PropTypes.string,
};

RichTextInput.defaultProps = {
  placeholder: '',
  onInputChange: () => {},
  onBlur: () => {},
  onFocus: () => {},
  onKeyDown: () => {},
  readOnly: false,
  defaultContent: '',
  shouldDisableToolBar: true,
  shouldShowToolBar: false,
  shouldLimitHeight: false,
  annotationSubject: '',
};

export default memo(RichTextInput);
