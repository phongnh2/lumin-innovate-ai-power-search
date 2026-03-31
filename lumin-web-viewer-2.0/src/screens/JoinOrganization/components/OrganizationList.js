import React from 'react';
import PropTypes from 'prop-types';

import JoinOrganizationItem from 'lumin-components/JoinOrganizationItem';

import * as Styled from '../JoinOrganization.styled';

const OrganizationList = ({ onItemClick, isSubmitting, list }) => (
  <Styled.List>
    {list.map((item) => (
      <JoinOrganizationItem key={item._id} organization={item} onClick={onItemClick} isSubmitting={isSubmitting} />
    ))}
  </Styled.List>
);

OrganizationList.propTypes = {
  onItemClick: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  list: PropTypes.array,
};

OrganizationList.defaultProps = {
  list: [],
};

export default OrganizationList;
