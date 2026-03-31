import classNames from 'classnames';
import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Trans, withTranslation } from 'react-i18next';

import core from 'core';

import ViewerContext from 'screens/Viewer/Context';

import Icomoon from 'lumin-components/Icomoon';
import PopperLimitWrapper from 'lumin-components/PopperLimitWrapper';
import Input from 'lumin-components/Shared/Input';
import { InputSize } from 'lumin-components/Shared/Input/types/InputSize';
import ActionButton from 'lumin-components/ViewerCommon/ActionButton';

import documentServices from 'services/documentServices';

import logger from 'helpers/logger';

import { validator, manipulation, eventTracking, toastUtils } from 'utils';

import UserEventConstants from 'constants/eventConstants';
import { LOGGER } from 'constants/lumin-common';
import { PAGES_TOOL_ERROR_MESSAGE } from 'constants/messages';
import toolNames from 'constants/toolsName';

import './EditPanelRotate.scss';

const propTypes = {
  currentDocument: PropTypes.object,
  thumbs: PropTypes.array,
  updateThumbs: PropTypes.func,
  t: PropTypes.func,
  setCurrentDocument: PropTypes.func.isRequired,
};

const defaultProps = {
  currentDocument: {},
  thumbs: [],
  updateThumbs: () => {},
  t: () => {},
};

const ROTATE_DIRECTION = {
  LEFT: -1,
  RIGHT: 1,
};

class EditPanelRotate extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rotatePages: '',
      rotatePagesMessage: '',
      fromPage: '',
      fromPageMessage: '',
      toPage: '',
      toPageMessage: '',
    };
  }

  // eslint-disable-next-line class-methods-use-this
  checkPageWithTotalPage = (input) => {
    const totalPages = core.getTotalPages();
    return input <= totalPages;
  };

  validatePageNumber = (value) => {
    const { t } = this.props;
    const validation = /^\d+(?:,\d+)*$/g;
    const splittedPage = value.split(',').map(Number);
    if (!validation.test(value)) {
      return t(PAGES_TOOL_ERROR_MESSAGE.MAKE_SURE_ABOVE_FORMAT);
    }
    if (!value || !splittedPage.every(validator.validateInputPages)) {
      return t(PAGES_TOOL_ERROR_MESSAGE.INVALID_PAGE_POSITION);
    }
    if (!splittedPage.every(this.checkPageWithTotalPage)) {
      return t(PAGES_TOOL_ERROR_MESSAGE.GREATER_THAN_TOTAL_PAGE);
    }
    return '';
  };

  checkPageLocked = (rotatePages) => {
    const { listPageDeleted } = this.context;
    const listPageLocked = [];
    rotatePages.forEach((page) => {
      if (listPageDeleted[page]) {
        listPageLocked.push(page);
      }
    });

    return listPageLocked;
  };

  rotatePages = async (pageIndexes, angle) => {
    const { currentDocument, updateThumbs, thumbs, t, setCurrentDocument } = this.props;
    const listPageLocked = this.checkPageLocked(pageIndexes);
    if (!listPageLocked.length) {
      try {
        if (currentDocument.isSystemFile) {
          setCurrentDocument({ ...currentDocument, unsaved: true });
        }
        pageIndexes.forEach((pageIndex) => {
          manipulation.rotateCssPage({ pageIndex: pageIndex - 1, angle });
        });
        await documentServices.rotatePages({ currentDocument, pageIndexes, angle });
        const thumbsUpdate = cloneDeep(thumbs);
        await Promise.all(
          pageIndexes.map(async (pageIndex) => {
            if (pageIndex <= thumbsUpdate.length) {
              const index = pageIndex - 1;
              const thumbRotate = await manipulation.onLoadThumbs(index);
              thumbsUpdate[index] = thumbRotate;
              thumbsUpdate[index].id = this.props.thumbs[index].id;
            }
          })
        );
        updateThumbs(thumbsUpdate);
      } catch (error) {
        logger.logError({
          reason: LOGGER.EVENT.PDFTRON_CORE_DOCUMENT,
          error,
        });
      }
    } else {
      let pageLocked = '';
      listPageLocked.forEach((page) => (pageLocked += `${page} `));
      const toastSetting = {
        message: t('viewer.leftPanelEditMode.pagePageLockedIsBlocked', { pageLocked }),
        top: 130,
      };
      toastUtils.warn(toastSetting);
    }
  };

  rotateByPages = (directionValue) => {
    const { rotatePages } = this.state;
    const { listPageDeleted } = this.context;
    if (!rotatePages.length) {
      const listAllPages = [];
      const totalPages = core.getTotalPages();
      for (let page = 0; page < totalPages; page++) {
        if (!listPageDeleted[page + 1]) {
          listAllPages.push(page + 1);
        }
      }
      this.rotatePages(listAllPages, directionValue);
      eventTracking(UserEventConstants.EventType.DOCUMENT_ROTATED, {
        pagesToRotate: listAllPages.toString(),
        pagesFrom: '',
        pagesTo: '',
      });
    } else {
      const error = this.validatePageNumber(rotatePages);
      if (!error) {
        const rotatePagesArray = rotatePages.split(',').map(Number);
        this.rotatePages(rotatePagesArray, directionValue);
        eventTracking(UserEventConstants.EventType.DOCUMENT_ROTATED, {
          pagesToRotate: rotatePages.toString(),
          pagesFrom: '',
          pagesTo: '',
        });
      }
    }
  };

  rotateByRange = (directionValue) => {
    const { fromPage, toPage } = this.state;
    if (!this.validatePageNumber(fromPage) && !this.validatePageNumber(toPage)) {
      const listRotateFromTo = [];
      const fromPageElement = Math.min(fromPage, toPage);
      const toPageElement = Math.max(fromPage, toPage);
      const { listPageDeleted } = this.context;
      for (let page = fromPageElement; page < toPageElement + 1; page++) {
        if (!listPageDeleted[page]) {
          listRotateFromTo.push(page);
        }
      }
      this.rotatePages(listRotateFromTo, directionValue);
      eventTracking(UserEventConstants.EventType.DOCUMENT_ROTATED, {
        pagesToRotate: listRotateFromTo.toString(),
        pagesFrom: fromPage,
        pagesTo: toPage,
      });
    }
  };

  handleChangePage = (stateName, stateMessage, value) => {
    const numericAndCommaRegex = stateName === 'rotatePages' ? /^[\d,]*$/g : /^[\d]*$/g;
    if (!numericAndCommaRegex.test(value)) {
      return;
    }
    const errorMessage = this.validatePageNumber(value);
    this.setState({
      [stateName]: value,
      [stateMessage]: errorMessage,
    });
  };

  render() {
    const { rotatePages, rotatePagesMessage, fromPage, fromPageMessage, toPage, toPageMessage } = this.state;
    const { t } = this.props;
    const placeHolder = 'message.EGPages';
    return (
      <div className="EditPanelRotate">
        <div className="EditPanelRotate__desc">
          <Trans
            i18nKey="viewer.leftPanelEditMode.descEditPanelRotate"
            components={{
              Icomoon: <Icomoon className="md_rotate_counter_clockwise" />,
            }}
          >
            Click the rotate button <Icomoon className="md_rotate_counter_clockwise" /> to rotate pages by 90°.
          </Trans>
        </div>
        <div className="EditPanelRotate__title">{t('viewer.leftPanelEditMode.rotateByPages')}</div>
        <div className="EditPanelRotate__content">
          <div className="EditPanelRotate__sub-title">
            <Trans i18nKey="viewer.leftPanelEditMode.subTitleEditPanelRotate">
              Enter a comma separated list of page numbers to rotate <span>(leave empty for all pages)</span>.
            </Trans>
          </div>
          <div className="EditPanelRotate__input-group">
            <Input
              size={InputSize.TINY}
              placeholder={t(placeHolder, { pages: ' 1, 4, 6' })}
              value={rotatePages}
              onChange={(e) => this.handleChangePage('rotatePages', 'rotatePagesMessage', e.target.value)}
              style={{ width: 210 }}
              errorMessage={rotatePagesMessage}
            />
            <PopperLimitWrapper
              onClick={() => this.rotateByPages(ROTATE_DIRECTION.LEFT)}
              toolName={toolNames.ROTATE_PAGE}
            >
              <ActionButton
                title="viewer.leftPanelEditMode.counterClockwise"
                icon="rotate-counter-clockwise"
                iconSize={18}
              />
            </PopperLimitWrapper>
            <PopperLimitWrapper
              onClick={() => this.rotateByPages(ROTATE_DIRECTION.RIGHT)}
              toolName={toolNames.ROTATE_PAGE}
            >
              <ActionButton title="viewer.leftPanelEditMode.clockwise" icon="rotate-clockwise" iconSize={18} />
            </PopperLimitWrapper>
          </div>
        </div>
        <div className="divider horizontal" />

        <div className="EditPanelRotate__title">{t('viewer.leftPanelEditMode.rotateByRange')}</div>
        <div className="EditPanelRotate__content">
          <div className="EditPanelRotate__input-form">
            <div className="InputForm__group">
              <div className="EditPanelRotate__sub-title EditPanelRotate__sub-title--lighter">
                {t('viewer.leftPanelEditMode.from')}
              </div>
              <Input
                size={InputSize.TINY}
                onChange={(e) => this.handleChangePage('fromPage', 'fromPageMessage', e.target.value)}
                value={fromPage}
                style={{ width: 100 }}
                placeholder={t(placeHolder, { pages: 1 })}
                className={classNames({
                  'LuminInput__wrapper--error': Boolean(fromPageMessage),
                })}
              />
            </div>
            <div className="InputForm__group">
              <div className="EditPanelRotate__sub-title EditPanelRotate__sub-title--lighter">
                {t('viewer.leftPanelEditMode.to')}
              </div>
              <Input
                size={InputSize.TINY}
                onChange={(e) => this.handleChangePage('toPage', 'toPageMessage', e.target.value)}
                value={toPage}
                style={{ width: 100 }}
                placeholder={t(placeHolder, { pages: 8 })}
                className={classNames({
                  'LuminInput__wrapper--error': Boolean(toPageMessage),
                })}
              />
            </div>
            <div className="InputForm__group">
              <PopperLimitWrapper
                onClick={() => this.rotateByRange(ROTATE_DIRECTION.LEFT)}
                toolName={toolNames.ROTATE_PAGE}
              >
                <ActionButton
                  title="viewer.leftPanelEditMode.counterClockwise"
                  icon="rotate-counter-clockwise"
                  iconSize={18}
                />
              </PopperLimitWrapper>
            </div>
            <div className="InputForm__group">
              <PopperLimitWrapper
                onClick={() => this.rotateByRange(ROTATE_DIRECTION.RIGHT)}
                toolName={toolNames.ROTATE_PAGE}
              >
                <ActionButton title="viewer.leftPanelEditMode.clockwise" icon="rotate-clockwise" iconSize={18} />
              </PopperLimitWrapper>
            </div>
          </div>
          <p className="LuminInput__error-message">{fromPageMessage || toPageMessage}</p>
        </div>
      </div>
    );
  }
}

EditPanelRotate.propTypes = propTypes;
EditPanelRotate.defaultProps = defaultProps;

export default withTranslation()(EditPanelRotate);
EditPanelRotate.contextType = ViewerContext;
