import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import selectors from 'selectors';

import SvgElement from 'lumin-components/SvgElement';
import Outline from 'luminComponents/Outline';

import getClassName from 'helpers/getClassName';

import './OutlinesPanel.scss';

const propTypes = {
  outlines: PropTypes.arrayOf(PropTypes.object),
  display: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

const defaultProps = {
  outlines: [],
  isDisabled: false,
};
class OutlinesPanel extends React.PureComponent {
  render() {
    const { isDisabled, t, outlines, display } = this.props;

    if (isDisabled) {
      return null;
    }

    const className = getClassName('Panel OutlinesPanel custom-scrollbar-reskin', this.props);

    return (
      <div className={className} style={{ display }} data-element="outlinesPanel">
        {outlines.length === 0 &&
          <div className="no-outlines">
            <SvgElement
              content="empty-outlines"
              width={80}
              height={80}
            />
            <p>{t('message.noOutlines')}</p>
          </div>}
        {outlines.map((outline, i) => (
          <Outline key={i} outline={outline} isVisible />
        ))}
      </div>
    );
  }
}

OutlinesPanel.propTypes = propTypes;
OutlinesPanel.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  outlines: selectors.getOutlines(state).model.children,
  isDisabled: selectors.isElementDisabled(state, 'outlinePanel'),
});

export default connect(mapStateToProps)(withTranslation()(OutlinesPanel));
