/* eslint-disable no-use-before-define */
import { debounce } from 'lodash';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import Popper from '@new-ui/general-components/Popper';

import core from 'core';

import { LayoutElements } from 'lumin-components/GeneralLayout/constants';

import { useTranslation } from 'hooks';

import exportNotesToTXT from 'helpers/exportNotesToTXT';
import fireEvent from 'helpers/fireEvent';

import { SortValues, ShowValues } from 'features/Comments/constants';

import { CUSTOM_EVENT } from 'constants/customEvent';

import { useGetMenuItems } from '../../hooks/useGetMenuItems';

import * as Styled from './HistoryPanelHeader.styled';

const CLOSE_POPPER_DELAY_TIME = 300;

function HistoryPanelHeader({
  sortComment,
  sortStrategy,
  notes,
  exportNoteOption,
  setShowNotesOption,
  currentDocument,
  currentUser,
}) {
  const { t } = useTranslation();
  const [sortOption, setSortOption] = useState(sortStrategy);
  const [exportOption, setExportOption] = useState(exportNoteOption);

  const [popperAnchorEl, setPopperAnchorEl] = useState(null);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const container = useRef();
  const menuItems = useGetMenuItems(currentUser);

  const closeCommentHistory = () => {
    setShowNotesOption(ShowValues.SHOW_ALL);
    core.deselectAllAnnotations();
    fireEvent(CUSTOM_EVENT.ON_LUMIN_LAYOUT_UPDATED, {
      elementName: LayoutElements.DEFAULT,
      isOpen: false,
    });
  };

  const getTitle = () => {
    const total = notes?.length || 0;
    return t('common.numberOfComment', { count: total });
  };

  const closePopper = () => {
    setPopperAnchorEl(null);
    setExportAnchorEl(null);
  };

  const onClick = (e, item) => {
    if (!item.value) {
      e.stopPropagation();
      return;
    }
    closePopper();
    if (Object.values(SortValues).includes(item.value)) {
      setSortOption(item.value);
      return;
    }

    if (item?.value === ShowValues.EXPORT_ALL_MY_NOTES) {
      exportNotesToTXT({ notesToExport: notes, documentName: currentDocument.name });
      return;
    }

    if ([ShowValues.EXPORT_MY_NOTES, ShowValues.SHOW_MY_NOTES, ShowValues.HIDE_NOTES].includes(item.value)) {
      if (item.value === exportNoteOption) {
        setExportOption(ShowValues.SHOW_ALL);
        return;
      }
      setExportOption(item.value);
    }
  };

  const handlePopoverOpen = (event) => {
    handlePopoverClose.cancel();
    setExportAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = useCallback(
    debounce(() => {
      setExportAnchorEl(null);
    }, CLOSE_POPPER_DELAY_TIME),
    []
  );

  const renderMenuItems = (itemList) =>
    itemList.map((item, index) => {
      if (item?.divider) {
        return <Styled.CustomDivider key={item.value} />;
      }
      if (item?.options) {
        return (
          <Styled.CustomMenuItem
            onClick={(event) => onClick(event, item)}
            key={index}
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            $isExpanded={exportAnchorEl}
          >
            <Styled.MenuContent>{t(`${item.title}`)}</Styled.MenuContent>
            <Styled.CustomIcon className="icon-next" size={6} $isExpandIcon />
            {renderExportOptions(item.options)}
          </Styled.CustomMenuItem>
        );
      }

      return (
        <Styled.CustomMenuItem onClick={(event) => onClick(event, item)} key={index}>
          {[sortOption, exportOption].includes(item?.value) && <Styled.CustomIcon className="icon-check" size={18} />}
          <Styled.MenuContent>{t(`${item.title}`)}</Styled.MenuContent>
        </Styled.CustomMenuItem>
      );
    });

  const renderExportOptions = (options) => (
    <Popper
      placement="left-start"
      open={Boolean(exportAnchorEl)}
      anchorEl={exportAnchorEl}
      onClose={() => setExportAnchorEl(null)}
    >
      <Styled.ListContainer disablePadding $isExpandList onMouseLeave={handlePopoverClose}>
        {renderMenuItems(options)}
      </Styled.ListContainer>
    </Popper>
  );

  useEffect(() => {
    if (sortOption && sortStrategy !== sortOption) {
      sortComment(sortOption);
    }
  }, [sortOption]);

  useEffect(() => {
    if (exportOption) {
      setShowNotesOption(exportOption);
    }
  }, [exportOption]);

  const renderSortButton = () => (
    <Popper open={Boolean(popperAnchorEl)} anchorEl={popperAnchorEl} onClose={() => setPopperAnchorEl(null)}>
      <Styled.ListContainer disablePadding>{renderMenuItems(menuItems)}</Styled.ListContainer>
    </Popper>
  );

  const onSortButtonClick = (event) => {
    setPopperAnchorEl(!popperAnchorEl ? event.currentTarget : null);
  };

  return (
    <Styled.HeaderContainer ref={container}>
      <Styled.HeaderWrapper>
        <Styled.HeaderTitle>{getTitle()}</Styled.HeaderTitle>
        <Styled.ButtonGroup>
          <Styled.SortButton icon="sort-icon" onClick={onSortButtonClick} />
          {renderSortButton()}
          <Styled.ClosePanelButton
            data-cy="close_panel_button"
            icon="md_close"
            iconSize={24}
            onClick={closeCommentHistory}
          />
        </Styled.ButtonGroup>
      </Styled.HeaderWrapper>
    </Styled.HeaderContainer>
  );
}

HistoryPanelHeader.propTypes = {
  currentDocument: PropTypes.object,
  sortComment: PropTypes.func.isRequired,
  sortStrategy: PropTypes.string.isRequired,
  notes: PropTypes.array,
  exportNoteOption: PropTypes.string,
  setShowNotesOption: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
};

HistoryPanelHeader.defaultProps = {
  notes: [],
  exportNoteOption: '',
  currentDocument: null,
  currentUser: null,
};
export default HistoryPanelHeader;
