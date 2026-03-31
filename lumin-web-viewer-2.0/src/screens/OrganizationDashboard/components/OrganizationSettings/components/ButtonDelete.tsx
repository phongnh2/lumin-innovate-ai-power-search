import classnames from 'classnames';
import React from 'react';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import ButtonMaterial from 'luminComponents/ButtonMaterial';

import { useTranslation } from 'hooks';

import { IOrganization } from 'interfaces/organization/organization.interface';

import { checkIsPreventDeleteOrganization } from '../helpers';

type Props = {
  organization: IOrganization;
  openDeletedModal: () => void;
  disabled?: boolean;
};

const ButtonDelete = (props: Props): JSX.Element => {
  const { organization, openDeletedModal, disabled } = props;
  const { t } = useTranslation();
  return (
    <ButtonMaterial
      className={classnames('OrganizationSettings__deleteButton', {
        'OrganizationSettings__deleteButton--active': !checkIsPreventDeleteOrganization(organization),
      })}
      disabled={disabled}
      size={ButtonSize.XL}
      onClick={organization.hasPendingInvoice ? undefined : openDeletedModal}
    >
      {t('orgSettings.deleteOrg')}
    </ButtonMaterial>
  );
};

ButtonDelete.defaultProps = {
  disabled: false,
};

export default ButtonDelete;
