import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import Button from 'lumin-components/ViewerCommon/ButtonLumin';
import ToolButtonPopper from 'luminComponents/ToolButtonPopper';

import promptUserChangeToolMode from 'helpers/promptUserChangeToolMode';
import { toggleFormFieldCreationMode } from 'helpers/toggleFormFieldCreationMode';

import { validator } from 'utils';

import { FEATURE_VALIDATION } from 'constants/lumin-common';

import './StateButton.scss';

const propTypes = {
  arrow: PropTypes.bool,
  dispatch: PropTypes.func,
  initialState: PropTypes.string.isRequired,
  mount: PropTypes.func.isRequired,
  unmount: PropTypes.func,
  didUpdate: PropTypes.func,
  states: PropTypes.shape({
    activeState: PropTypes.shape({
      img: PropTypes.string,
      label: PropTypes.string,
      onClick: PropTypes.func.isRequired,
      title: PropTypes.string.isRequired,
      getContent: PropTypes.func.isRequired,
    }),
    AnotherState: PropTypes.shape({
      img: PropTypes.string,
      label: PropTypes.string,
      onClick: PropTypes.func.isRequired,
      title: PropTypes.string.isRequired,
      getContent: PropTypes.func.isRequired,
    }),
    toolName: PropTypes.string,
  }),
  currentDocument: PropTypes.object,
  currentUser: PropTypes.object,
  dataElement: PropTypes.string,
  closeElements: PropTypes.func,
  additionalClass: PropTypes.string,
  match: PropTypes.object,
  isTablet: PropTypes.bool,
  isOffline: PropTypes.bool,
  t: PropTypes.func,
};

const defaultProps = {
  arrow: false,
  dispatch: () => {},
  unmount: () => {},
  didUpdate: () => {},
  states: {},
  currentDocument: {},
  currentUser: {},
  dataElement: '',
  closeElements: () => {},
  additionalClass: '',
  match: {},
  isTablet: false,
  isOffline: false,
  t: () => {},
};

class StatefulButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeState: this.props.initialState,
      openPopper: false,
    };
  }

  componentDidMount() {
    const { mount } = this.props;
    if (mount) {
      mount(this.update);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { didUpdate, states } = this.props;
    if (didUpdate) {
      didUpdate(prevProps, this.props, states[prevState.activeState], states[this.state.activeState], this.update);
    }
  }

  componentWillUnmount() {
    const { unmount } = this.props;
    if (unmount) {
      unmount();
    }
  }

  isToolLimited = () => {
    const { currentDocument, currentUser, match } = this.props;
    if (match.params.documentId === process.env.DOCUMENT_TOUR_ID || match.params.documentId === 'tour') {
      return false;
    }
    /**
     * Bug in firefox, need check currentDocument
     */
    if (!currentDocument || !currentUser) {
      return true;
    }

    const featureLimitType = validator.validateFeature({
      currentUser, currentDocument,
    });
    return (
      featureLimitType === FEATURE_VALIDATION.SIGNIN_REQUIRED ||
      featureLimitType === FEATURE_VALIDATION.PERMISSION_REQUIRED
    );
  };

  update = (newState) => {
    if (newState) {
      this.setState({
        activeState: newState,
      });
    } else {
      this.forceUpdate();
    }
  };

  onClick = () => {
    const { activeState } = this.state;
    const { states, dispatch, closeElements, t } = this.props;
    if (this.isToolLimited()) {
      this.togglePopper();
      closeElements(['toolsOverlay', 'searchOverlay', 'toolStylePopup', 'viewControlsOverlay', 'signatureOverlay']);
      return;
    }

    const shouldStopEvent =
      toggleFormFieldCreationMode() ||
      promptUserChangeToolMode({
        callback: () => {
          this.props.states[activeState].onClick(this.update, states[activeState], dispatch);
        },
        translator: t,
      });
    if (shouldStopEvent) {
      return;
    }

    this.props.states[activeState].onClick(this.update, states[activeState], dispatch);
  };

  togglePopper = () => {
    this.setState(({ openPopper }) => ({
      openPopper: !openPopper,
    }));
  };

  closePopper = () => {
    this.setState({ openPopper: false });
  };

  render() {
    const { activeState, openPopper } = this.state;
    const { states, additionalClass, arrow, isTablet } = this.props;
    const { title, img, getContent, isActive, icon } = states[activeState];
    const { toolName } = states;
    const content = getContent ? getContent(states[activeState]) : '';
    const tourGuideClassName = `joyride-viewer-signature${isTablet ? '-tablet' : ''}`;
    const className = [
      'StatefulButton',
      arrow ? 'down-arrow' : '',
      states[activeState].className ? states[activeState].className : '',
      additionalClass,
      toolName === 'signature' ? tourGuideClassName : '',
    ]
      .join(' ')
      .trim();
    return (
      <ToolButtonPopper openPopper={openPopper} closePopper={this.closePopper} toolName={toolName}>
        <Button
          iconSize={18}
          title={title}
          className={className}
          isActive={isActive && isActive(this.props)}
          img={img}
          icon={icon}
          label={content}
          onClick={this.onClick}
          {...this.props}
        />
      </ToolButtonPopper>
    );
  }
}

StatefulButton.propTypes = propTypes;
StatefulButton.defaultProps = defaultProps;

export default withTranslation()(StatefulButton);
