import Autocomplete from '@mui/material/Autocomplete';
import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from 'styled-components';

import Popper from '@new-ui/general-components/Popper';

import { MenuItem } from 'lumin-components/GeneralLayout/general-components/Menu';
import Paper from 'lumin-components/GeneralLayout/general-components/Paper';
import TextField from 'lumin-components/GeneralLayout/general-components/TextField';
import Icomoon from 'luminComponents/Icomoon';

import * as Styled from './Select.styled';

const Select = React.forwardRef(
  (
    {
      options,
      value: valueFromProps,
      inputProps,
      valueKey,
      labelKey,
      displayCheckIcon,
      noFilter,
      fullWidth,
      canEditInput,
      checkIconPosition,
      popupIconProps,
      slotProps,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const classes = Styled.useStyle({ theme });

    const value = options.find((option) => option[valueKey] === valueFromProps) || null;

    const renderInput = (textFieldProps) => {
      const { InputLabelProps, InputProps, inputProps: autocompleteInputProps, ...otherProps } = textFieldProps;
      const { ref: rootRef, ...restInputProps } = InputProps;
      const mergedProps = {
        ...InputLabelProps,
        ...restInputProps,
        ...otherProps,
        ...inputProps,
        inputProps: {
          ...autocompleteInputProps,
          readOnly: !canEditInput,
        },
        rootRef,
      };

      return <TextField {...mergedProps} />;
    };

    return (
      <Autocomplete
        classes={classes}
        PaperComponent={Paper}
        options={options}
        getOptionLabel={(option) => option[labelKey] || ''}
        renderOption={(optionProps, option, { selected }) => {
          const menuItemStyle = {
            ...optionProps?.style,
            ...option.itemProps?.style,
          };
          return (
            <MenuItem
              {...optionProps}
              {...option.itemProps}
              {...(checkIconPosition === 'start'
                ? { displayCheckIcon, hideIcon: !selected }
                : {
                    renderSuffix: () =>
                      displayCheckIcon && selected ? (
                        <Icomoon className="sm_check" size={14} style={{ marginRight: '4px' }} />
                      ) : null,
                  })}
              style={menuItemStyle}
              activated={selected}
            >
              {option[labelKey]}
            </MenuItem>
          );
        }}
        popupIcon={<Icomoon className="new_small_down_solid" size={16} {...popupIconProps} />}
        ListboxComponent={Styled.MenuComponent}
        PopperComponent={Popper}
        disableClearable
        renderInput={renderInput}
        {...(noFilter ? { filterOptions: (options) => options } : {})}
        value={value}
        ref={ref}
        fullWidth={fullWidth}
        slotProps={{
          ...slotProps,
          popper: {
            placement: 'bottom-start',
            ...slotProps?.popper,
            sx: {
              minWidth: 'var(--kiwi-spacing-20)',
              ...slotProps?.popper?.sx,
            },
          },
          paper: {
            ...slotProps?.paper,
            sx: {
              minWidth: 'var(--kiwi-spacing-20)',
              ...slotProps?.paper?.sx,
            },
          },
        }}
        {...props}
      />
    );
  }
);

Select.propTypes = {
  options: PropTypes.array.isRequired,
  inputProps: PropTypes.object,
  valueKey: PropTypes.string,
  labelKey: PropTypes.string,
  displayCheckIcon: PropTypes.bool,
  noFilter: PropTypes.bool,
  value: PropTypes.any,
  fullWidth: PropTypes.bool,
  canEditInput: PropTypes.bool,
  checkIconPosition: PropTypes.oneOf(['start', 'end']),
  popupIconProps: PropTypes.object,
  selectOnFocus: PropTypes.bool,
  slotProps: PropTypes.object,
};

Select.defaultProps = {
  inputProps: {},
  valueKey: 'value',
  labelKey: 'label',
  displayCheckIcon: true,
  noFilter: false,
  value: undefined,
  fullWidth: false,
  canEditInput: true,
  checkIconPosition: 'start',
  popupIconProps: {},
  selectOnFocus: true,
  slotProps: {},
};

export default Select;
