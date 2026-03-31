import PropTypes from 'prop-types';
import React from 'react';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Icomoon from 'lumin-components/Icomoon';

import { useDesktopMatch, useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { Colors } from 'constants/lumin-common';

import * as Styled from './OrganizationMemberFilteringPermission.styled';

const propTypes = {
  toggleAddDialog: PropTypes.func,
};

const defaultProps = {
  toggleAddDialog: () => {},
};

const OrganizationMemberFilteringPermission = ({
  toggleAddDialog,
}) => {
  const { t } = useTranslation();
  const isDesktopUp = useDesktopMatch();

  if (isDesktopUp) {
    return null;
  }

  return (
    <>
      <Styled.Button
        size={ButtonSize.LG}
        onClick={toggleAddDialog}
        data-lumin-btn-name={ButtonName.INVITE_CIRCLE_MEMBER}
      >
        <Icomoon className="add-member" size={13} color={Colors.WHITE} />
        <Styled.TextButton>{t('memberPage.inviteMembers')}</Styled.TextButton>
      </Styled.Button>
      <Styled.FAB
        onClick={toggleAddDialog}
        aria-label="Add"
      >
        <Icomoon className="add-member" size={17} color={Colors.WHITE} />
      </Styled.FAB>
    </>
  );
};

OrganizationMemberFilteringPermission.propTypes = propTypes;
OrganizationMemberFilteringPermission.defaultProps = defaultProps;

export default OrganizationMemberFilteringPermission;
