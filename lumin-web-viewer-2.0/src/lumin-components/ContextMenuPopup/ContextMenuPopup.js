import PropTypes from 'prop-types';
import React from 'react';

import { getShortcut } from '@new-ui/components/LuminToolbar/utils';
import IconButton from '@new-ui/general-components/IconButton';
import Popper from '@new-ui/general-components/Popper';

import core from 'core';

import getToolPopper from 'helpers/getToolPopper';
import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import setToolModeAndGroup from 'helpers/setToolModeAndGroup';

import toolsName from 'constants/toolsName';

import { store } from '../../redux/store';

import './ContextMenuPopup.scss';

const createVirtualElement = (left, top) => ({
  getBoundingClientRect: () => ({
    width: 0,
    height: 0,
    top,
    right: left,
    bottom: top,
    left,
  }),
});

const propTypes = {
  isOpen: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isInContentEditMode: PropTypes.bool,
  openElement: PropTypes.func.isRequired,
  closeElement: PropTypes.func.isRequired,
  closeElements: PropTypes.func.isRequired,
  disabledElements: PropTypes.object,
  popupItems: PropTypes.array,
  currentDocument: PropTypes.object,
  currentUser: PropTypes.object,
  t: PropTypes.func,
  isInReadAloudMode: PropTypes.bool,
  isPreviewOriginalVersionMode: PropTypes.bool,
  isInPresenterMode: PropTypes.bool,
};

const defaultProps = {
  isOpen: false,
  isDisabled: false,
  isInContentEditMode: false,
  disabledElements: {},
  popupItems: [],
  currentDocument: {},
  currentUser: {},
  t: () => {},
  isInReadAloudMode: false,
  isPreviewOriginalVersionMode: false,
  isInPresenterMode: false,
};
class ContextMenuPopup extends React.PureComponent {
  constructor() {
    super();
    this.popup = React.createRef();
    this.state = {
      virtualAnchorEl: null,
    };
  }

  componentDidMount() {
    document.addEventListener('contextmenu', this.onContextMenu);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.props.closeElements(['annotationPopup', 'textPopup']);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('contextmenu', this.onContextMenu);
  }

  onContextMenu = (e) => {
    const { tagName } = e.target;
    const clickedOnInput = tagName === 'INPUT';
    const clickedOnTextarea = tagName === 'TEXTAREA';
    const clickedOnDocumentContainer = document.querySelector('.DocumentContainer').contains(e.target);

    if (clickedOnDocumentContainer && !(clickedOnInput || clickedOnTextarea)) {
      e.preventDefault();

      const { left, top } = this.getPopupPosition(e);

      if (this.props.popupItems.length > 0) {
        this.setState({
          virtualAnchorEl: createVirtualElement(left, top),
        });
        this.props.openElement('contextMenuPopup');
      }
    } else {
      this.props.closeElement('contextMenuPopup');
    }
  };

  getPopupPosition = (e) => {
    let { pageX: left, pageY: top } = e;

    if (this.popup.current) {
      const { width, height } = this.popup.current.getBoundingClientRect();
      const documentContainer = document.getElementsByClassName('DocumentContainer')[0];
      const containerBox = documentContainer.getBoundingClientRect();
      const horizontalGap = 2;
      const verticalGap = 2;

      if (left < containerBox.left) {
        left = containerBox.left + horizontalGap;
      }
      if (left + width > containerBox.right) {
        left = containerBox.right - width - horizontalGap;
      }

      if (top < containerBox.top) {
        top = containerBox.top + verticalGap;
      }
      if (top + height > containerBox.bottom) {
        top = containerBox.bottom - height - verticalGap;
      }
    }

    return { left, top };
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  handleClickOutside = () => {
    this.props.closeElement('contextMenuPopup');
  };

  handleClick = (toolName, dataElement) => {
    const { closeElement, disabledElements, t } = this.props;
    const callback = () => {
      if (disabledElements[dataElement]) {
        return;
      }
      setToolModeAndGroup(store, toolName);
      closeElement('contextMenuPopup');
    };
    const shouldPreventEvent = promptUserChangeToolMode({ callback, translator: t });
    if (!shouldPreventEvent) {
      callback();
    }
  };

  render() {
    const {
      isOpen,
      isDisabled,
      currentDocument,
      currentUser,
      t,
      isInContentEditMode,
      isInReadAloudMode,
      isPreviewOriginalVersionMode,
      isInPresenterMode,
    } = this.props;

    const isInFormBuilderMode = core.getFormFieldCreationManager().isInFormFieldCreationMode();
    if (
      isDisabled ||
      isInFormBuilderMode ||
      isInContentEditMode ||
      isInReadAloudMode ||
      isPreviewOriginalVersionMode ||
      isInPresenterMode
    ) {
      return null;
    }

    const { virtualAnchorEl } = this.state;
    const [isDisabledHighlight, isDisabledFreehand, isDisabledFreetext, isDisabledSticky] = [
      toolsName.HIGHLIGHT,
      toolsName.FREEHAND,
      toolsName.FREETEXT,
      toolsName.STICKY,
    ].map((tool) => !!getToolPopper({ currentDocument, currentUser, toolName: tool, translator: t }).title);

    return (
      <Popper
        open={isOpen}
        anchorEl={virtualAnchorEl}
        data-element="contextMenuPopup"
        onClose={this.handleClickOutside}
      >
        <div className="ContextMenuPopup" ref={this.popup}>
          <IconButton
            dataElement="panToolButton"
            icon="tool-pan"
            onClick={() => this.handleClick('Pan')}
            tooltipData={{ location: 'bottom', title: t('tool.pan'), shortcut: getShortcut('pan') }}
          />
          {!isDisabledSticky && (
            <IconButton
              dataElement="stickyToolButton"
              icon="add-comment"
              onClick={() => this.handleClick(toolsName.STICKY, 'stickyToolButton')}
              tooltipData={{ location: 'bottom', title: t('action.comment'), shortcut: getShortcut('sticky') }}
            />
          )}
          {!isDisabledHighlight && (
            <IconButton
              dataElement="highlightToolButton"
              icon="tool-highlight"
              onClick={() => this.handleClick(toolsName.HIGHLIGHT, 'highlightToolButton')}
              tooltipData={{ location: 'bottom', title: t('annotation.highlight'), shortcut: getShortcut('highlight') }}
            />
          )}
          {!isDisabledFreehand && (
            <IconButton
              dataElement="freeHandToolButton"
              icon="tool-freehand"
              onClick={() => this.handleClick(toolsName.FREEHAND, 'freeHandToolButton')}
              tooltipData={{ location: 'bottom', title: t('action.draw'), shortcut: getShortcut('freeHand') }}
            />
          )}
          {!isDisabledFreetext && (
            <IconButton
              dataElement="freeTextToolButton"
              icon="tool-freetext"
              onClick={() => this.handleClick(toolsName.FREETEXT, 'freeTextToolButton')}
              tooltipData={{ location: 'bottom', title: t('action.type'), shortcut: getShortcut('freeText') }}
            />
          )}
        </div>
      </Popper>
    );
  }
}

ContextMenuPopup.propTypes = propTypes;
ContextMenuPopup.defaultProps = defaultProps;

export default ContextMenuPopup;
