/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { ThemeProvider } from 'styled-components';

import ContentEditColor from 'lumin-components/ContentEditPanel/component/ContentEditColor';
import ContentEditStyle from 'lumin-components/ContentEditPanel/component/ContentEditStyle';
import Button from 'lumin-components/ViewerCommon/ButtonLumin';

import { useTranslation } from 'hooks';

import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';

import { useEditPDFContext } from 'features/EditPDF/hooks/useEditPDFContext';

import defaultTool from 'constants/defaultTool';
import { THEME_MODE } from 'constants/lumin-common';

import './ContentEditPanel.scss';

import * as Styled from './ContentEditPanel.styled';

const ContentEditPanel = (props) => {
  const {
    isOpenContentEditPanel,
    isShowTopBar,
    isShowBannerAds,
    isShowToolbarTablet,
    themeMode,
    isOpenRightToolPanel,
    showWarningBanner,
  } = props;

  const {
    format,
    selectionMode,
    textEditProperties,
    handleFontStyleChange,
    handleTextFormatChange,
    handleColorChange,
  } = useEditPDFContext();

  const { t } = useTranslation();

  const onClickCloseContentEdit = () => {
    promptUserChangeToolMode({ defaultTool });
  };

  return (
    <ThemeProvider theme={Styled.theme[themeMode]}>
      <div
        className={classNames({
          Panel: true,
          ContentEditPanel: true,
          open: isOpenContentEditPanel,
          closed: !isOpenContentEditPanel,
          'open-right-toolbar': isOpenRightToolPanel,
          'has-warning-banner': showWarningBanner,
          'has-top-bar': isShowTopBar,
          'has-toolbar': isShowToolbarTablet,
          'has-banner': isShowBannerAds,
          'is-in-content-edit-mode': true,
        })}
        data-element="rightContentEditPanel"
        onMouseDown={(e) => {
          if (e.type !== 'touchstart') {
            e.preventDefault();
          }
        }}
      >
        <div
          className={classNames({
            ContentEditPanel__top: true,
          })}
        >
          <p>{t('viewer.formBuildPanel.properties')}</p>
          <Button icon="cancel" onClick={onClickCloseContentEdit} iconSize={14} />
        </div>

        <hr className="title-divider" />
        <Styled.StyledContent>
          <ContentEditStyle
            freeTextMode={selectionMode === 'FreeText'}
            contentSelectMode={selectionMode === 'ContentBox'}
            isOpenContentEditPanel={isOpenContentEditPanel}
            textEditProperties={textEditProperties}
            disabled={!selectionMode}
            onFontStyleChange={handleFontStyleChange}
            onTextFormatChange={handleTextFormatChange}
            format={format}
          />
          <Styled.StyledTabContentDivider />
          <div>
            <ContentEditColor
              disabled={!selectionMode}
              handleColorChange={handleColorChange}
              format={format}
              isOpenRightToolPanel={isOpenRightToolPanel}
            />
          </div>
        </Styled.StyledContent>
      </div>
    </ThemeProvider>
  );
};

ContentEditPanel.propTypes = {
  isOpenContentEditPanel: PropTypes.bool,
  isShowTopBar: PropTypes.bool,
  isShowBannerAds: PropTypes.bool,
  isShowToolbarTablet: PropTypes.bool,
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)),
  isOpenRightToolPanel: PropTypes.bool,
  showWarningBanner: PropTypes.bool,
};

ContentEditPanel.defaultProps = {
  isOpenContentEditPanel: false,
  isShowTopBar: false,
  isShowBannerAds: false,
  isShowToolbarTablet: false,
  themeMode: THEME_MODE.LIGHT,
  isOpenRightToolPanel: false,
  showWarningBanner: false,
};

export default ContentEditPanel;
