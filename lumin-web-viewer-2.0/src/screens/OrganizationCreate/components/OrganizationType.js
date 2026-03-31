import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import Tooltip from 'lumin-components/Shared/Tooltip';
import Icomoon from 'lumin-components/Icomoon';

import { Colors } from 'constants/styles';
import { capitalize } from 'utils';
import { ORGANIZATION_CREATION_TYPE, ORGANIZATION_TEXT } from 'constants/organizationConstants';
import { FORM_INPUT_NAME } from 'utils/Factory/EventCollection/FormEventCollection';

import { useTabletMatch } from 'hooks';
import {
  StyledItemType,
  StyledItemLabelTypeWrapper,
  StyledItemLabel,
  StyledItemContent,
  StyledItemTooltip,
  StyledItemMarker,
} from '../OrganizationCreate.styled';
import { OrganizationCreateContext } from '../OrganizationCreate.context';
import OrganizationTypeRadioGroup from './OrganizationTypeRadioGroup';

const tooltipStyle = {
  minWidth: 300,
  fontSize: 12,
  padding: '12px',
  fontWeight: 400,
  lineHeight: '16px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  margin: '12px 0',
};

const OrganizationType = ({ organizationTypeError, canCreateMainOrg }) => {
  const { state, setState } = useContext(OrganizationCreateContext);
  const { orgCreationType } = state;
  const isTabletUpMatched = useTabletMatch();

  const radioList = [
    {
      value: ORGANIZATION_CREATION_TYPE.AUTOMATIC,
      disabled: !canCreateMainOrg,
      label: `Main ${ORGANIZATION_TEXT}`,
    },
    {
      value: ORGANIZATION_CREATION_TYPE.MANUAL,
      label: `Custom ${ORGANIZATION_TEXT}`,
    },
  ];

  return (
    <StyledItemType>
      <StyledItemLabelTypeWrapper>
        <StyledItemLabel>{capitalize(ORGANIZATION_TEXT)} Type</StyledItemLabel>
        <StyledItemTooltip>
          <Tooltip
            title={
              <>
                <p>In main {ORGANIZATION_TEXT}, most of the members have the same email domain. Admin is able to:</p>
                <StyledItemMarker>
                  <li>Require members to sign in with a verified Google account</li>
                  <li>Auto-approve new members with the same domain as your {capitalize(ORGANIZATION_TEXT)}</li>
                </StyledItemMarker>
              </>
            }
            tooltipStyle={tooltipStyle}
            placement="bottom-start"
          >
            <Icomoon
              size={isTabletUpMatched ? 18 : 12}
              className="info"
              color={Colors.NEUTRAL_60}
            />
          </Tooltip>
        </StyledItemTooltip>
      </StyledItemLabelTypeWrapper>
      <StyledItemContent>
        <OrganizationTypeRadioGroup
          name={FORM_INPUT_NAME.ORGANIZATION_TYPE}
          defaultValue={orgCreationType}
          handleChange={(event) => setState({ orgCreationType: event.target.value })}
          radioList={radioList}
          organizationTypeError={organizationTypeError}
        />
      </StyledItemContent>
    </StyledItemType>
  );
};

OrganizationType.propTypes = {
  organizationTypeError: PropTypes.string,
  canCreateMainOrg: PropTypes.bool,
};

OrganizationType.defaultProps = {
  organizationTypeError: '',
  canCreateMainOrg: true,
};

export default OrganizationType;
