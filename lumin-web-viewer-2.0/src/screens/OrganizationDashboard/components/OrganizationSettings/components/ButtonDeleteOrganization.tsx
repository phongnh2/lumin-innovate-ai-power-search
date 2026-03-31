/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { LastJoinedOrgTooltip } from 'luminComponents/LastJoinedOrgTooltip';
import Tooltip from 'luminComponents/Shared/Tooltip';

import { useTranslation } from 'hooks';

import { dateUtil } from 'utils';

import { IOrganization } from 'interfaces/organization/organization.interface';

import ButtonDelete from './ButtonDelete';

type Props = {
  organization: IOrganization;
  handleReactivateOrg: () => void;
  openDeletedModal: () => void;
};

const ButtonDeleteOrganization = ({ organization, handleReactivateOrg, openDeletedModal }: Props): JSX.Element => {
  const { t } = useTranslation();
  if (organization.deletedAt) {
    return (
      <div className="OrganizationSettings__orgButtonReactive">
        <p className="OrganizationSettings__reactivateText">
          {t('orgSettings.yourOrgWillDelete', {
            date: dateUtil.formatMDYTime(organization.deletedAt),
          })}
        </p>
        <ButtonMaterial
          size={ButtonSize.XL}
          className="OrganizationSettings__reactivateButton"
          onClick={handleReactivateOrg}
        >
          {t('orgSettings.reactivate')}
        </ButtonMaterial>
      </div>
    );
  }
  return (
    <div className="OrganizationSettings__orgButtonDelete">
      {organization.hasPendingInvoice ? (
        // @ts-ignore
        <Tooltip title={t('orgSettings.tooltipDeleteOrg')}>
          <div>
            <ButtonDelete organization={organization} openDeletedModal={openDeletedModal} disabled />
          </div>
        </Tooltip>
      ) : (
        <LastJoinedOrgTooltip title={t('orgSettings.tooltipDeleteLastJoinedOrg')}>
          <ButtonDelete organization={organization} openDeletedModal={openDeletedModal} />
        </LastJoinedOrgTooltip>
      )}
    </div>
  );
};

export default ButtonDeleteOrganization;
