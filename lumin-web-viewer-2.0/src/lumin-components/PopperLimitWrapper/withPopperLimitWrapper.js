import camelCase from 'lodash/camelCase';
import PropTypes from 'prop-types';
import React from 'react';

import { useTrackingModalEvent } from 'hooks/useTrackingModalEvent';

const withPopperLimitWrapper = (WrapperComponent) => {
  const PopperHOC = ({ ...props }) => {
    const toolName = camelCase(props.toolName);
    const { trackModalViewed, trackModalConfirmation, trackModalDismiss } = useTrackingModalEvent({
      modalName: `${props.eventName || toolName}PopOver`, modalPurpose: 'Premium tool pop-over',
    });
    return (
      <WrapperComponent
        {...props}
        trackModalViewed={trackModalViewed}
        trackModalConfirmation={trackModalConfirmation}
        trackModalDismiss={trackModalDismiss}
      />
    );
  };
  PopperHOC.propTypes = {
    toolName: PropTypes.string.isRequired,
    eventName: PropTypes.string,
  };
  PopperHOC.defaultProps = {
    eventName: '',
  };
  return PopperHOC;
};
export default withPopperLimitWrapper;
