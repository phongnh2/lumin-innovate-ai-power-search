import ClickAwayListener from '@mui/material/ClickAwayListener';
import Popper from '@mui/material/Popper';
import React, { useRef, useState } from 'react';
import { connect, useSelector } from 'react-redux';

// eslint-disable-next-line import/no-named-as-default
import ButtonSuffixInput from '@new-ui/general-components/ButtonSuffixInput';

import useZoomDocument from 'luminComponents/GeneralLayout/components/PageNavigation/hook/useZoomDocument';

import { useTranslation } from 'hooks';

import { selectors as editorChatBotSelectors } from 'features/EditorChatBot/slices';

import { onZoomValueSubmit } from './utils';
import ZoomNumericInput from './ZoomNumericInput';
// eslint-disable-next-line import/no-named-as-default
import ZoomPopperContent from './ZoomPopperContent';

const format = (value) => Number(value.split('%')[0]);

const FLAG = 'zoom-input';

export const ZoomTool = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const inputRef = useRef();
  const isAiProcessing = useSelector(editorChatBotSelectors.getIsAiProcessing);
  const { currentZoomLevel } = useZoomDocument();
  const showPopper = (target) => {
    setAnchorEl(target);
  };

  const hidePopper = () => {
    setAnchorEl(null);
  };

  const onKeyDown = (e) => {
    if (e.which !== 13) {
      return;
    }
    const value = format(e.target.value);
    onZoomValueSubmit(value);
  };

  const onFocus = () => {
    showPopper(inputRef.current);
  };

  const clickAwayHandler = (event) => {
    if (event.target.dataset.flag === FLAG) {
      return;
    }

    const input = inputRef.current.querySelector('input');
    const value = format(input.value);

    onZoomValueSubmit(value);
    hidePopper();
  };

  const open = Boolean(anchorEl) && !isAiProcessing;
  const id = open ? 'zoom-popper' : undefined;

  return (
    <>
      <ButtonSuffixInput
        id={id}
        onSuffixClick={() => showPopper(inputRef.current)}
        tooltipProps={{ content: t('action.zoom') }}
        inputComponent={ZoomNumericInput}
        value={currentZoomLevel}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        inputProps={{ 'data-flag': FLAG }}
        ref={inputRef}
        disabled={isAiProcessing}
      />

      <Popper
        anchorEl={anchorEl}
        open={open}
        onClose={hidePopper}
        style={{ zIndex: 'var(--zindex-popover)' }}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ]}
        disablePortal
        elevation={5}
        placement="bottom-start"
      >
        <ClickAwayListener onClickAway={clickAwayHandler}>
          <div>
            <ZoomPopperContent closePopper={hidePopper} />
          </div>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

ZoomTool.propTypes = {};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ZoomTool);
