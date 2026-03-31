import PropTypes from 'prop-types';
import React from 'react';

import ActionButton from 'luminComponents/ActionButton';
import CustomElement from 'luminComponents/CustomElement';
import StatefulButton from 'luminComponents/StatefulButton';
import ToggleElementButton from 'luminComponents/ToggleElementButton';
import ToolButton from 'luminComponents/ToolButton';
import ToolGroupButton from 'luminComponents/ToolGroupButton';

const propTypes = {
  // The data element of the popup component.
  // Used to grab button props from redux and use those props to override the existing ones, if there're any
  dataElement: PropTypes.string.isRequired,
  // An object that maps an item's dataElement to a functional React component
  children: PropTypes.arrayOf(PropTypes.any).isRequired,
  items: PropTypes.array.isRequired,
};

const CustomizablePopup = ({ children, items }) => {

  const childrenArray = React.Children.toArray(children);

  return items.map((item, i) => {
    const { dataElement, type, hidden } = item;
    const key = `${type}-${dataElement || i}`;
    const mediaQueryClassName = hidden
      ?.map((screen) => `hide-in-${screen}`)
      .join(' ');
    let component = childrenArray.find(
      (child) => child.props.dataElement === dataElement || child.props['data-element'] === dataElement,
    );

    // duplicate code in HeaderItems.js, must clean up after 6.0
    if (!component) {
      const props = { ...item, mediaQueryClassName };

      if (type === 'toolButton') {
        component = <ToolButton {...props} />;
      }

      if (type === 'toolGroupButton') {
        component = <ToolGroupButton {...props} />;
      }

      if (type === 'toggleElementButton') {
        component = <ToggleElementButton {...props} />;
      }

      if (type === 'actionButton') {
        component = <ActionButton {...props} />;
      }

      if (type === 'statefulButton') {
        component = <StatefulButton {...props} />;
      }

      if (type === 'customElement') {
        component = <CustomElement {...props} />;
      }

      if (type === 'spacer' || type === 'divider') {
        component = (
          <div className={`${type} ${mediaQueryClassName}`} {...props} />
        );
      }
    }

    return component
      ? React.cloneElement(component, {
        key,
      })
      : null;
  });
};

CustomizablePopup.propTypes = propTypes;

export default CustomizablePopup;
