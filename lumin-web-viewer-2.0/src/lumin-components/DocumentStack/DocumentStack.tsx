/* eslint-disable @typescript-eslint/ban-ts-comment */
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Link } from 'react-router-dom';

import selectors from 'selectors';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Icomoon from 'lumin-components/Icomoon';
import Tooltip from 'lumin-components/Shared/Tooltip';
import MaterialPopper from 'luminComponents/MaterialPopper';

import { useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { OrganizationUtilities } from 'utils/Factory/Organization';
import { PaymentUrlSerializer } from 'utils/payment';

import { PERIOD, Plans } from 'constants/plan';
import { STATIC_PAGE_PRICING } from 'constants/Routers';
import { Colors } from 'constants/styles';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { IOrganizationPayment } from 'interfaces/payment/payment.interface';

import presentsImage from '../../../assets/images/presents.svg';

import * as Styled from './DocumentStack.styled';

type OrganizationData = {
  data?: IOrganization;
};

type TButtonData = {
  onClick?: () => void;
  content: string;
  to?: string;
  eventName: string;
};

const useStyles = makeStyles({
  styleContent: {
    '&&': {
      borderColor: Colors.PRIMARY_50,
    },
  },
  popperContent: {
    '&&': {
      padding: 0,
      width: 208,
    },
  },
});

const DocumentStack = (): JSX.Element => {
  const { data: currentOrganization } = useSelector<unknown, OrganizationData>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const classes = useStyles();
  const [ref, setRef] = useState<HTMLDivElement>(null);
  const [openPopper, setOpenPopper] = useState(false);
  const { t } = useTranslation();

  const {
    payment = {
      trialInfo: {
        canStartTrial: false,
        canUseProTrial: false,
      },
    } as IOrganizationPayment,
    docStackStorage,
    _id: orgId,
  }: IOrganization = currentOrganization || ({} as IOrganization);
  const orgUtilities = new OrganizationUtilities({ organization: currentOrganization });

  const { canStartTrial, canUseProTrial } = payment.trialInfo;
  const { totalUsed, totalStack } = docStackStorage || {};

  const getContentButtonByManager = (): TButtonData => {
    if (canStartTrial) {
      const plan = canUseProTrial ? Plans.ORG_PRO : Plans.ORG_BUSINESS;
      const trialUrl = new PaymentUrlSerializer()
        .trial(true)
        .of(orgId)
        .plan(plan)
        .period(PERIOD.ANNUAL)
        .returnUrlParam()
        .get();
      return {
        content: t('common.unlockMore'),
        to: trialUrl,
        eventName: ButtonName.START_TRIAL_ON_DOC_STACK_DOC_LIST,
      };
    }
    return {
      content: t('common.accessMore'),
      to: STATIC_PAGE_PRICING,
      eventName: ButtonName.GO_PREMIUM_ON_DOC_STACK_DOC_LIST,
    };
  };

  const getPopperData = (): {
    title: string;
    content: string;
    btnData?: TButtonData;
  } => {
    const buttonData = getContentButtonByManager();
    if (canStartTrial) {
      return {
        title: t('docStackDropdown.getMoreDocuments'),
        content: t('docStackDropdown.letSwitchToBilling'),
        btnData: buttonData,
      };
    }
    return {
      title: t('docStackDropdown.accessMoreDocuments'),
      content: t('docStackDropdown.letUpgrade'),
      btnData: buttonData,
    };
  };

  const popperData = getPopperData();
  const { to, onClick } = popperData.btnData || {};

  const linkProps = { ...(to && { to }), component: Link };
  const noneLinkProps = { ...(onClick && { onClick }) };

  if (!currentOrganization || !orgUtilities.payment.isFree()) {
    return null;
  }

  return (
    <>
      <Styled.DocumentStackContainer
        ref={(_ref) => setRef(_ref)}
        onClick={() => setOpenPopper(true)}
        data-lumin-btn-name={ButtonName.CLICK_DOC_STACK_ON_DOC_LIST}
      >
        <Styled.StatusContainer>
          <Styled.Status>{t('docStackDropdown.docStack', { totalUsed, totalStack })}</Styled.Status>
          {/* @ts-ignore */}
          <Tooltip title={t('topHeader.docStack.tooltip')} placement="bottom-start">
            {/* @ts-ignore */}
            <Icomoon className="info" size={18} color={Colors.NEUTRAL_60} />
          </Tooltip>
        </Styled.StatusContainer>

        {/* @ts-ignore */}
        <Styled.Progress $width={(totalUsed / totalStack) * 100} />
      </Styled.DocumentStackContainer>
      {/* @ts-ignore */}
      <MaterialPopper
        open={openPopper}
        anchorEl={ref}
        placement="bottom"
        classes="DocumentStackContainer__popper"
        parentOverflow="viewport"
        disablePortal
        onClose={() => setOpenPopper(false)}
        handleClose={() => setOpenPopper(false)}
        scrollbarClassName={classes.popperContent}
        styleContentClasses={classes.styleContent}
      >
        {/* @ts-ignore */}
        <Styled.PopperContainer>
          {/* @ts-ignore */}
          <Styled.CloseButton rounded icon="cancel" iconSize={14} onClick={() => setOpenPopper(false)} />
          <Styled.PopperImgContainer>
            <Styled.PopperImage src={presentsImage } alt="document stack image" />
          </Styled.PopperImgContainer>
          <Styled.Title>{popperData.title}</Styled.Title>
          <Styled.Description>{popperData.content}</Styled.Description>
          {popperData.btnData && (
            /* @ts-ignore */
            <Styled.ButtonLink
              {...linkProps}
              {...noneLinkProps}
              color={ButtonColor.PRIMARY_RED}
              size={ButtonSize.XS}
              fullWidth
              data-lumin-btn-name={popperData.btnData.eventName}
            >
              {popperData.btnData.content}
            </Styled.ButtonLink>
          )}
        </Styled.PopperContainer>
      </MaterialPopper>
    </>
  );
};

export default DocumentStack;
