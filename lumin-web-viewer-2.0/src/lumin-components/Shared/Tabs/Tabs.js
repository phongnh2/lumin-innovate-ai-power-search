import MaterialButton from '@mui/material/Button';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from 'styled-components';

import Tooltip from 'lumin-components/Shared/Tooltip';

import { Colors } from 'constants/styles/Colors';

import PopperButtonTab from './components/PopperButtonTab';

import * as Styled from './Tabs.styled';

function Tabs({
  onChange,
  tabs,
  classes: classesProp,
  defaultValue,
  value,
  isLink,
  activeBarColor,
  className,
  disabled,
  fullWidth,
}) {
  const theme = useTheme();
  const classes = Styled.useStyle({ activeBarColor, theme });
  const isActive = (index) => value === index || defaultValue === index;
  const [elementsOverflow, setElementsOverflow] = useState([]);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (itemRefs.current) {
      const itemsOverflow = itemRefs.current.map((ref) => ref.scrollWidth > ref.clientWidth);
      setElementsOverflow(itemsOverflow);
    }
  }, []);

  const renderTabButton = (tab, index) => {
    if (tab.popperItems) {
      return (
        <PopperButtonTab
          key={tab.value}
          defaultValue={defaultValue}
          value={value}
          tab={tab}
          classesProp={classesProp}
          activeBarColor={activeBarColor}
          onChange={onChange}
          disabled={disabled}
        />
      );
    }

    return(
      <Tooltip
        key={tab.value}
        title={tab.tooltip || ''}
        placement="top"
        disableHoverListener={!(elementsOverflow[index])}
      >
        <MaterialButton
          data-lumin-btn-name={tab.buttonName}
          data-lumin-btn-purpose={tab.buttonPurpose}
          className={classNames([classes.tab, classesProp.tab], {
            [classNames([classes.tabActive, classesProp.tabActive])]: isActive(
              tab.value,
            ),
          })}
          disabled={disabled || Boolean(tab.disabled)}
          onClick={() => onChange(tab.value)}
        >
          {tab.icon && (
            <Styled.Icon isActive={isActive(tab.value)}>{tab.icon}</Styled.Icon>
          )}
          {tab.label && (
            <Styled.Label ref={(element) => {itemRefs.current[index] = element;}}>
              {tab.label}
            </Styled.Label>
          )}
          {tab.suffix}
        </MaterialButton>
      </Tooltip>
    );
  };

  const renderTabLink = (tab) => (
    <MaterialButton
      key={tab.value}
      className={classNames([
        'ButtonMaterial--link',
        classes.tab,
        classesProp.tab,
      ])}
    >
      <NavLink
        to={tab.to}
        className={classNames([classes.tab, classesProp.tab])}
        activeClassName={classNames([classes.tabActive, classesProp.tabActive])}
        data-lumin-btn-name={tab.buttonName}
        data-lumin-btn-purpose={tab.buttonPurpose}
      >
        {tab.icon && (
          <Styled.Icon isActive={isActive(tab.value)}>{tab.icon}</Styled.Icon>
        )}
        {tab.label && <Styled.Label>{tab.label}</Styled.Label>}
      </NavLink>
    </MaterialButton>
  );

  return (
    <Styled.Container className={className} $fullWidth={fullWidth}>
      {isLink ? tabs.map(renderTabLink) : tabs.map(renderTabButton)}
    </Styled.Container>
  );
}

Tabs.propTypes = {
  onChange: PropTypes.func,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
      icon: PropTypes.element,
      disabled: PropTypes.bool,
      to: PropTypes.string,
      suffix: PropTypes.node,
      popperItems: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          label: PropTypes.string,
          tooltip: PropTypes.string,
          parentValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          onClick: PropTypes.func,
        })
      ),
      tooltip: PropTypes.string,
    }),
  ),
  classes: PropTypes.shape({
    tab: PropTypes.string,
    tabActive: PropTypes.string,
  }),
  defaultValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isLink: PropTypes.bool,
  activeBarColor: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
};

Tabs.defaultProps = {
  onChange: () => {},
  tabs: [],
  classes: {
    tab: '',
    tabActive: '',
  },
  defaultValue: null,
  isLink: false,
  value: null,
  activeBarColor: Colors.NEUTRAL_100,
  className: null,
  disabled: false,
  fullWidth: false,
};

export default Tabs;
