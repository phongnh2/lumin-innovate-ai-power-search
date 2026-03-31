import PropTypes from 'prop-types';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import OrganizationImg from 'assets/lumin-svgs/empty-org-list.svg';
import EmptyOrgListGraphic from 'assets/reskin/images/empty-org-list-graphic.png';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Icomoon from 'lumin-components/Icomoon';

import { useTranslation } from 'hooks';

import { Routers } from 'constants/Routers';
import { Colors } from 'constants/styles';

import * as Styled from './EmptyOrgList.styled';

import styles from './EmptyOrgList.module.scss';

function EmptyOrgList({ isReskin }) {
  const { t } = useTranslation();
  const location = useLocation();
  const isFromPlan = location.state && location.state.fromPlan;

  if (isReskin) {
    return (
      <div className={styles.container}>
        <img src={EmptyOrgListGraphic} alt={`Lumin ${t('organizations', { ns: 'terms' })}`} />
      </div>
    );
  }

  return (
    <Styled.Container>
      <Styled.ImgContainer $isFromPlan={isFromPlan}>
        <Styled.Img src={OrganizationImg} alt={`Lumin ${t('organizations', { ns: 'terms' })}`} />
      </Styled.ImgContainer>
      {isFromPlan && (
        <Styled.CreateOrgFirst>
          <Icomoon className="info" size={18} color={Colors.PRIMARY_90} />
          <Styled.CreateOrgFirstText>{t('listOrgs.descriptionEmpty')}</Styled.CreateOrgFirstText>
        </Styled.CreateOrgFirst>
      )}
      <Styled.CreateButton size={ButtonSize.XL} component={Link} to={Routers.ORGANIZATION_CREATE}>
        {t('listOrgs.createNewOrg')}
      </Styled.CreateButton>
    </Styled.Container>
  );
}

EmptyOrgList.propTypes = {
  isReskin: PropTypes.bool,
};

EmptyOrgList.defaultProps = {
  isReskin: false,
};

export default EmptyOrgList;
