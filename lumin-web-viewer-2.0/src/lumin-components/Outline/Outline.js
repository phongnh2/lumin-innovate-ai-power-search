import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import actions from 'actions';

import Icomoon from 'luminComponents/Icomoon';

import { isMobile } from 'helpers/device';
import { handlePromptCallback } from 'helpers/promptUserChangeToolMode';

import { OutlineCoreUtils } from 'features/Outline/utils/outlineCore.utils';

import toolsName from 'constants/toolsName';

import './Outline.scss';

const propTypes = {
  outline: PropTypes.object.isRequired,
  closeElement: PropTypes.func.isRequired,
  isVisible: PropTypes.bool.isRequired,
  t: PropTypes.func,
};

const defaultProps = {
  t: () => {},
};
class Outline extends React.PureComponent {
  state = {
    isExpanded: false,
  };

  onClickExpand = () => {
    this.setState((prevState) => ({
      isExpanded: !prevState.isExpanded,
    }));
  };

  onClickOutline = () => {
    const { outline, closeElement } = this.props;

    this.onClickExpand();
    OutlineCoreUtils.goToOutline(outline);
    if (isMobile()) {
      closeElement('leftPanel');
    }
  };

  getIconClass = () => {
    const { isExpanded } = this.state;

    return classNames('arrow-right-alt', 'Outline__arrow__wrapper', {
      expanded: isExpanded,
    });
  };

  getOutlineClass = () => {
    const { isVisible } = this.props;

    return classNames('Outline', {
      hidden: !isVisible,
    });
  };

  getOutlineChildClass = () => {
    const { isVisible } = this.props;

    return classNames('Outline__container--child', {
      hidden: !isVisible,
    });
  };

  render() {
    const { outline, closeElement, t } = this.props;
    const { isExpanded } = this.state;
    return (
      <>
        <div className={this.getOutlineClass()}>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            className="Outline__container"
            onClick={handlePromptCallback({
              callback: this.onClickOutline,
              applyForTool: toolsName.REDACTION,
              translator: t,
            })}
          >
            {outline.children.length > 0 && (
              <div>
                <Icomoon className={this.getIconClass()} size={10} />
              </div>
            )}
            <div>{outline.name}</div>
          </div>
        </div>

        {outline.children.length > 0 && (
          <div className={this.getOutlineChildClass()}>
            {outline.children.map((outline, i) => (
              <Outline outline={outline} key={i} isVisible={isExpanded} closeElement={closeElement} />
            ))}
          </div>
        )}
      </>
    );
  }
}

Outline.propTypes = propTypes;
Outline.defaultProps = defaultProps;

const mapDispatchToProps = {
  closeElement: actions.closeElement,
};

export default connect(null, mapDispatchToProps)(Outline);
