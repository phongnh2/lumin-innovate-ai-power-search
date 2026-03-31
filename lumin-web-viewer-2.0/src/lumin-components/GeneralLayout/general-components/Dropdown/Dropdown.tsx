import React, { useRef, useState } from 'react';
import { useTheme } from 'styled-components';

import MenuList, { MenuItem } from '@new-ui/general-components/Menu';
import Popper from '@new-ui/general-components/Popper';
import TextField from '@new-ui/general-components/TextField';

import ClickAwayListener from 'luminComponents/Shared/ClickAwayListener';

import styles from './Dropdown.module.scss';

interface IOption {
  value: string;
  label: string;
  style?: React.CSSProperties;
}

type DropdownProps = {
  options: IOption[];
  onSelect: (option: IOption) => void;
  selectedValue: string;
  disabled: boolean;
};

const DEFAULT_MAX_HEIGHT = 320;

const Dropdown = ({ disabled, options, onSelect, selectedValue }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const selectedRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();

  const handleOpenSelect = () => {
    setOpen(true);
  };

  const handleSelect = ({ value, label }: IOption) => {
    onSelect({
      value,
      label,
    });
    setOpen(false);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div className={styles.dropdownWrapper}>
        <TextField
          rootRef={selectedRef}
          value={options.find((option) => option.value === selectedValue)?.label}
          onClick={handleOpenSelect}
          disabled={disabled}
          showSuffix
          suffixProps={{
            className: 'new_small_down_solid',
            size: 16,
            color: theme.kiwi_colors_surface_on_surface,
          }}
        />
        <Popper open={open} anchorEl={selectedRef.current} disablePortal>
          <MenuList
            style={{
              width: selectedRef.current?.clientWidth,
              maxHeight: DEFAULT_MAX_HEIGHT,
              boxSizing: 'border-box',
              overflowY: 'auto',
            }}
          >
            {options.map(({ value, label, style }) => (
              <MenuItem
                key={value}
                onClick={() =>
                  handleSelect({
                    value,
                    label,
                    style,
                  })
                }
                icon="new_tick"
                iconSize={16}
                hideIcon={selectedValue !== value}
              >
                <span style={style}>{label}</span>
              </MenuItem>
            ))}
          </MenuList>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default Dropdown;
