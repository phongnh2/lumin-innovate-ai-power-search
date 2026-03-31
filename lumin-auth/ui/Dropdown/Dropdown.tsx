import ClickAwayListener from '@mui/base/ClickAwayListener';
import { Fade } from '@mui/material';
import classNames from 'classnames';
import { cloneElement, MouseEvent, useState } from 'react';

import { DropdownProps } from './interfaces';

import * as Styled from './Dropdown.styled';

function Dropdown(props: DropdownProps) {
  const { trigger, id, children = () => null, placement, verticalGap = false, disableClickAway, triggerStyles, disabled = false } = props;
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<EventTarget & Element>();
  const handleClick = (e: MouseEvent) => {
    if (disabled) {
      return;
    }
    setOpen(prev => !prev);
    setAnchorEl(e.currentTarget);
  };

  const closePopper = () => {
    setOpen(false);
  };

  const handleClickAway = () => {
    if (disableClickAway) {
      return;
    }
    closePopper();
  };
  return (
    <div>
      <Styled.TriggerWrapper onClick={handleClick} css={triggerStyles} disabled={disabled}>
        {cloneElement(trigger, { className: classNames(trigger.props.className, { active: open, disabled }) })}
      </Styled.TriggerWrapper>

      <Styled.Popper id={id} open={open && Boolean(anchorEl)} anchorEl={anchorEl} transition placement={placement}>
        {({ TransitionProps }) => {
          return (
            <ClickAwayListener onClickAway={handleClickAway}>
              <Fade in={TransitionProps?.in} onEnter={TransitionProps?.onEnter} onExited={TransitionProps?.onExited} timeout={250}>
                <Styled.ChildrenContainer verticalGap={verticalGap}>{children?.({ open, closePopper })}</Styled.ChildrenContainer>
              </Fade>
            </ClickAwayListener>
          );
        }}
      </Styled.Popper>
    </div>
  );
}

Dropdown.defaultProps = {
  placement: 'bottom-end'
};

export default Dropdown;
