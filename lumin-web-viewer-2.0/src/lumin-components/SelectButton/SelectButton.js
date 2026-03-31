import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import core from 'core';

import ButtonLumin from 'lumin-components/ViewerCommon/ButtonLumin';

import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';

import './SelectButton.scss';

const propTypes = {
  isActive: PropTypes.bool.isRequired,
  icon: PropTypes.string,
  title: PropTypes.string,
  toolName: PropTypes.string,
  t: PropTypes.func,
  isInContentEditMode: PropTypes.bool,
};

const defaultProps = {
  icon: '',
  title: '',
  toolName: '',
  t: () => {},
  isInContentEditMode: false,
};

class SelectButton extends PureComponent {
  onClick = () => {
    const { toolName, isInContentEditMode, t } = this.props;
    const shouldStopEvent =
      toggleFormFieldCreationMode() ||
      (!isInContentEditMode && promptUserChangeToolMode({ toolName, translator: t }));
    if (shouldStopEvent) {
      return;
    }
    core.setToolMode(toolName);
  };

  render() {
    const { icon, title } = this.props;
    const className = classNames('SelectButton', {
      'SelectButton--has-margin': title === 'tool.pan',
    });
    return (
      <ButtonLumin
        {...this.props}
        aria-label="selectTool"
        className={className}
        icon={icon}
        iconSize={16}
        title={title}
        onClick={this.onClick}
      />
    );
  }
}

SelectButton.propTypes = propTypes;
SelectButton.defaultProps = defaultProps;

export default SelectButton;
