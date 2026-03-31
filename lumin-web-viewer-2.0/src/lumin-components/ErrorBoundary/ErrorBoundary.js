import { merge } from 'lodash';
import { typographies } from 'lumin-ui/tokens';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import logger from 'helpers/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error,
      errorInfo,
    });
    // You can also log error messages to an error reporting service here
    logger.logError({
      reason: 'ErrorBoundary error',
      error: merge({}, error, errorInfo),
    });
  }

  render() {
    const { shouldRenderEmpty, t } = this.props;
    if (this.state.errorInfo) {
      if (shouldRenderEmpty) {
        return null;
      }
      // Error path
      return (
        <div style={{ padding: '20px' }}>
          <h2
            style={{
              ...typographies.kiwi_typography_body_sm,
            }}
          >
            {t('common.somethingWentWrong')}
          </h2>
          {!process.env.VERSION?.includes('production') && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}
ErrorBoundary.propTypes = {
  children: PropTypes.element,
  shouldRenderEmpty: PropTypes.bool,
  t: PropTypes.func.isRequired,
};
ErrorBoundary.defaultProps = {
  children: null,
  shouldRenderEmpty: false,
};
export default withTranslation()(ErrorBoundary);
