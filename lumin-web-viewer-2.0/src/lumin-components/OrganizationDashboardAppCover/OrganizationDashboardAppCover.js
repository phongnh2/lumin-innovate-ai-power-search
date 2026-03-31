import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import Dialog from 'lumin-components/Dialog';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { ORGANIZATION_TEXT, ORG_TEXT } from 'constants/organizationConstants';
import { capitalize } from 'utils';
import ImageModal from 'assets/images/information.png';
import * as Styled from './OrganizationDashboadAppCover.styled';

const propTypes = {
  currentOrganization: PropTypes.object,
};

const defaultProps = {
  currentOrganization: {},
};

function OrganizationDashboardAppCover({ currentOrganization }) {
  const URL = `/${ORG_TEXT}/${currentOrganization.data.url}/documents`;
  return (
    <Dialog
      width={328}
      open
    >
      <Styled.Container>
        <Styled.ImageInformation src={ImageModal} alt="img-modal-app" />
        <Styled.Description>
          Discover Lumin on computer for better dashboard experience!
        </Styled.Description>
        <ButtonMaterial
          fullWidth
          component={Link}
          to={URL}
        >
          Back to {capitalize(ORGANIZATION_TEXT)} Document
        </ButtonMaterial>
      </Styled.Container>
    </Dialog>
  );
}

OrganizationDashboardAppCover.propTypes = propTypes;
OrganizationDashboardAppCover.defaultProps = defaultProps;

export default OrganizationDashboardAppCover;
