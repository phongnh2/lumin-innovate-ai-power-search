import MaterialButton from '@mui/material/Button';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';

import Icomoon from 'lumin-components/Icomoon';
import PopperButton from 'lumin-components/PopperButton';

import { Colors } from 'constants/styles';

import TabPopover from './TabPopover';
import * as Styled from '../Tabs.styled';

const PopperButtonTab = ({
  value,
  tab,
  activeBarColor,
  classesProp,
  disabled
}) => {
  const theme = useTheme();
  const classes = Styled.useStyle({ activeBarColor, theme });
  const defaultItem = tab.popperItems.find((item) => value === item.value);
  const [activeItem, setActiveItem] = useState({
    value: defaultItem?.value || tab.value,
    label:defaultItem?.label || tab.label,
  });
  const [isOpen, setIsOpen] = useState(false);
  const isActive = tab.popperItems.some((item) => value === item.value) || value === tab.value;

  useEffect(() => {
    if (!isActive) {
      setActiveItem({
        label: tab.label,
        value: tab.value,
      });
    }
  }, [value]);

  const renderPopover = ({ closePopper }) => (
    <TabPopover
      closePopper={closePopper}
      list={tab.popperItems}
      activeItem={activeItem}
      setActiveItem={setActiveItem}
      activeBarColor={activeBarColor}
    />
  );

  return (
    <PopperButton
      key={tab.value}
      className={classNames([classes.tab, classesProp.tab], {
        [classNames([classes.tabActive, classesProp.tabActive])]: isActive,
      })}
      popperProps={{
        placement: 'bottom-start',
        disablePortal: false,
        parentOverflow: 'viewport',
      }}
      ButtonComponent={MaterialButton}
      renderPopperContent={renderPopover}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      disabled={disabled}
    >
      {activeItem.label && <Styled.Label>{activeItem.label}</Styled.Label>}
      <Styled.WrapperIcomoon $isOpen={isOpen}>
        <Icomoon className="dropdown" size={10}/>
      </Styled.WrapperIcomoon>
    </PopperButton>
  );

};

PopperButtonTab.propTypes = {
  tab: PropTypes.shape({
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
      })
    ),
  }).isRequired,
  activeBarColor: PropTypes.string,
  classesProp: PropTypes.shape({
    tab: PropTypes.string,
    tabActive: PropTypes.string,
  }),
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  disabled: PropTypes.bool,
};

PopperButtonTab.defaultProps = {
  activeBarColor: Colors.NEUTRAL_100,
  classesProp: {
    tab: '',
    tabActive: '',
  },
  value: null,
  disabled: false,
};

export default PopperButtonTab;