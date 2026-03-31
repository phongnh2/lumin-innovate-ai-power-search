import { capitalize } from 'lodash';
import React, { useEffect, useRef, useCallback } from 'react';

import * as organizationGraphService from 'services/graphServices/organization';

import logger from 'helpers/logger';

import { ORGANIZATION_TEXT } from 'constants/organizationConstants';

const withOrganization = (WrappedComponent) => {
  const OrganizationHOC = ({ ...rest }) => {
    const subcriptionUpdateOrganizationRef = useRef(null);

    useEffect(() => () => {
      try {
        if (subcriptionUpdateOrganizationRef.current) {
          subcriptionUpdateOrganizationRef.current.unsubscribe();
          subcriptionUpdateOrganizationRef.current = null;
        }
      } catch (error) {
        logger.logError({
          error,
          reason: `${capitalize(ORGANIZATION_TEXT)} document error`,
        });
      }
    }, []);

    const subcribeUpdateOrganization = useCallback((orgId, events) => {
      subcriptionUpdateOrganizationRef.current = organizationGraphService.updateOrganization({
        orgId,
        callback: ({ organization, type }) => {
          if (events[type]) {
            events[type].exec(organization);
          }
        },
      });
    }, []);

    return (
      <WrappedComponent
        subcribeUpdateOrganization={subcribeUpdateOrganization}
        {...rest}
      />
    );
  };

  OrganizationHOC.defaultProps = {};
  return OrganizationHOC;
};
export default withOrganization;
