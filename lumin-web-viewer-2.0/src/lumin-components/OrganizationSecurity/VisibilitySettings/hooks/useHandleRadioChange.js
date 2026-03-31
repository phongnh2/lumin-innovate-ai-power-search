import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import actions from 'actions';
import selectors from 'selectors';

import { useUrlSearchParams, useTranslation, useEnableWebReskin } from 'hooks';

import { organizationServices } from 'services';
import orgTracking from 'services/awsTracking/organizationTracking';

import { toastUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { OrganizationUtilities } from 'utils/Factory/Organization';

import { ModalTypes } from 'constants/lumin-common';
import { InviteUsersSetting } from 'constants/organization.enum';
import {
  DOMAIN_VISIBILITY_SETTING,
  VISIBILITY_SETTING_CALLBACK_ACTION,
} from 'constants/organizationConstants';
import { UrlSearchParam } from 'constants/UrlSearchParam';

const useHandleRadioChange = () => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchParam = useUrlSearchParams();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const { _id: orgId, settings } = currentOrganization;
  const { domainVisibility, inviteUsersSetting } = settings || {};
  const [isExpandList, setIsExpandList] = useState(
    searchParam.get('section') === 'visibility' ? false : domainVisibility !== DOMAIN_VISIBILITY_SETTING.INVITE_ONLY
  );
  const orgUtilities = new OrganizationUtilities({ organization: currentOrganization });
  const hasDomain = orgUtilities.domainList().length > 0;
  const [isLoading, setIsLoading] = useState(false);

  const submitChangeOrgSetting = async (_domainVisibility) => {
    setIsLoading(true);
    dispatch(
      actions.updateModalProperties({
        isProcessing: true,
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      })
    );
    try {
      const orgSettings = await organizationServices.updateDomainVisibilitySetting({
        orgId,
        visibilitySetting: _domainVisibility,
      });
      const newSettings = {
        ...orgSettings,
        domainVisibility: orgSettings.domainVisibility,
      };
      dispatch(actions.updateCurrentOrganization({ settings: newSettings }));
      dispatch(actions.updateOrganizationInList(orgId, { settings: newSettings }));
      toastUtils.success({ message: t('orgSettings.visibilitySettingsUpdated') });
      setIsExpandList(_domainVisibility !== DOMAIN_VISIBILITY_SETTING.INVITE_ONLY);
    } catch (error) {
      toastUtils.openUnknownErrorToast();
    } finally {
      setIsLoading(false);
    }
  };

  const showModalHasNoDomain = (_domainVisibility) => {
    const modalData = {
      type: ModalTypes.WARNING,
      title: t('orgSettings.makeThisOrgVisible'),
      message: t('orgSettings.messageMakeThisOrgVisible'),
      confirmButtonTitle: t('orgSettings.makeAnyway'),
      onCancel: () => {},
      onConfirm: () => submitChangeOrgSetting(_domainVisibility),
      useReskinModal: true,
    };
    dispatch(actions.openModal(modalData));
  };

  const showReviseModal = (_domainVisibility) => {
    const modalData = {
      type: ModalTypes.WARNING,
      title: t('orgDashboardSecurity.reviseModal.title'),
      message: t('orgDashboardSecurity.reviseModal.message1'),
      confirmButtonTitle: t('orgDashboardSecurity.reviseModal.processAnyway'),
      onCancel: () => {},
      onConfirm: () => submitChangeOrgSetting(_domainVisibility),
      useReskinModal: true,
    };
    dispatch(actions.openModal(modalData));
  };

  const showActionCannotBePerformedModal = (_domainVisibility) => {
    const modalData = {
      type: ModalTypes.ERROR,
      title: t('orgDashboardSecurity.hitSlotModal.title'),
      message: t('orgDashboardSecurity.hitSlotModal.message'),
      onConfirm: () => {},
      useReskinModal: true,
      confirmButtonProps: {
        withExpandedSpace: true,
      },
    };
    dispatch(actions.openModal(modalData));
  };

  const changeToNeedApprove = (_domainVisibility) => {
    if (!hasDomain) {
      showModalHasNoDomain(_domainVisibility);
      return;
    }
    if (inviteUsersSetting === InviteUsersSetting.ANYONE_CAN_INVITE) {
      showReviseModal(_domainVisibility);
      return;
    }
    submitChangeOrgSetting(_domainVisibility);
  };

  const changeToAutoApprove = (_domainVisibility) => {
    if ((orgUtilities.payment.isBusinessAnnual() || orgUtilities.payment.isEnterprise()) && !orgUtilities.hasSlot()) {
      showActionCannotBePerformedModal();
      return;
    }

    if (!hasDomain) {
      showModalHasNoDomain(_domainVisibility);
      return;
    }

    submitChangeOrgSetting(_domainVisibility);
  };

  const changeToInvite = (_domainVisibility) => {
    if (!hasDomain) {
      submitChangeOrgSetting(_domainVisibility);
      return;
    }
    const modalSettings = {
      type: ModalTypes.WARNING,
      title: t('orgSettings.loneRanger'),
      message: (
        <span>
          <Trans
            i18nKey="orgSettings.messageInviteOnly"
            values={{ domains: orgUtilities.getDomainsWithAtSign() }}
            components={{ strong: <b className={isEnableReskin && 'kiwi-message--primary'} /> }}
          />
        </span>
      ),
      confirmButtonTitle: t('orgSettings.changeAnyway'),
      onCancel: () => {},
      onConfirm: () => submitChangeOrgSetting(_domainVisibility),
      useReskinModal: true,
    };
    dispatch(actions.openModal(modalSettings));
  };

  const handleRadioChange = async (e) => {
    let _domainVisibility;
    if (typeof e === 'string') {
      _domainVisibility = e;
    } else {
      _domainVisibility = e.target.value;
    }

    switch (_domainVisibility) {
      case DOMAIN_VISIBILITY_SETTING.INVITE_ONLY:
        orgTracking.trackChangeSetting({
          elementName: ButtonName.VISIBILITY_INVITE_ONLY,
        });
        await changeToInvite(_domainVisibility);
        break;
      case DOMAIN_VISIBILITY_SETTING.VISIBLE_AUTO_APPROVE:
        orgTracking.trackChangeSetting({
          elementName: ButtonName.VISIBILITY_AUTO_APPROVE,
        });
        await changeToAutoApprove(_domainVisibility);
        break;
      case DOMAIN_VISIBILITY_SETTING.VISIBLE_NEED_APPROVE:
        orgTracking.trackChangeSetting({
          elementName: ButtonName.VISIBILITY_REQUEST_ACCESS,
        });
        await changeToNeedApprove(_domainVisibility);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const callback = searchParam.get(UrlSearchParam.CALLBACK_ACTION);
    if (callback === VISIBILITY_SETTING_CALLBACK_ACTION.ALLOW_CERTAIN_DOMAIN) {
      changeToAutoApprove(DOMAIN_VISIBILITY_SETTING.VISIBLE_AUTO_APPROVE);
      navigate('', { replace: true });
    }
  }, [searchParam]);

  return { isExpandList, handleRadioChange, isLoading };
};

export { useHandleRadioChange };
