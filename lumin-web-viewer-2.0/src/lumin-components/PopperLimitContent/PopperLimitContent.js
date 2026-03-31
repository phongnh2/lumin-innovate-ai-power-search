import classNames from 'classnames';
import get from 'lodash/get';
import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import selectors from 'selectors';

import SvgElement from 'lumin-components/SvgElement';

import { useTranslation } from 'hooks';
import { useGetRemoveButtonProStartTrial } from 'hooks/growthBook/useGetRemoveButtonProStartTrial';
import useShallowSelector from 'hooks/useShallowSelector';
import { useTrackingModalEvent } from 'hooks/useTrackingModalEvent';

import { authServices } from 'services';

import getOrgIdOfDoc from 'helpers/getOrgIdOfDoc';
import getOrgOfDoc from 'helpers/getOrgOfDoc';

import { PaymentUtilities } from 'utils/Factory/Payment';
import { getPremiumModalContent } from 'utils/getPremiumModalContent';

import { MAX_SIZE_MERGE_DOCUMENT } from 'constants/documentConstants';
import { FEATURE_VALIDATION } from 'constants/lumin-common';
import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { PLAN_TYPE_LABEL } from 'constants/plan';
import { Routers } from 'constants/Routers';
import { TOOLS_NAME } from 'constants/toolsName';

import * as styles from './V2/PopperLimitContent.styled';
import './PopperLimitContent.scss';

PopperLimitContent.propTypes = {
  type: PropTypes.string,
  currentDocument: PropTypes.object,
  handleOpenModal: PropTypes.func,
  toolName: PropTypes.string,
  eventName: PropTypes.string,
};

const ButtonBase = ({ children, ...rest }) => (
  <Button size="lg" fullWidth {...rest}>
    {children}
  </Button>
);

ButtonBase.propTypes = {
  children: PropTypes.node.isRequired,
};

function PopperLimitContent({
  type = '',
  currentDocument = {},
  handleOpenModal = () => {},
  toolName = '',
  eventName = '',
}) {
  const { t } = useTranslation();
  const organizations = useShallowSelector(selectors.getOrganizationList);
  const { isRemoveButtonProStartTrial } = useGetRemoveButtonProStartTrial();
  const { trackModalViewed, trackModalDismiss, trackModalConfirmation } = useTrackingModalEvent({
    modalName: `${eventName}PopOver`,
    modalPurpose: 'Premium tool pop-over',
  });

  useEffect(() => {
    if (type === FEATURE_VALIDATION.PREMIUM_FEATURE) {
      trackModalViewed();
    }
  }, [type]);

  const renderButtonGroup = (trialInfo) => {
    const { canUseProTrial } = trialInfo;
    const orgId = getOrgIdOfDoc({ currentDocument });
    const isSharedOrGuestUser = currentDocument.isShared || currentDocument.isGuest;
    const { startTrialButton, upgradeButton } = getPremiumModalContent({
      orgId,
      trialInfo,
    });

    if (canUseProTrial) {
      return (
        <div className={classNames('PopperLimit__btn-group', { 'two-column': !isRemoveButtonProStartTrial })}>
          <ButtonBase
            to={startTrialButton.link}
            component={Link}
            variant={!isRemoveButtonProStartTrial ? 'outlined' : 'filled'}
            onClick={trackModalDismiss}
          >
            {t(startTrialButton.label)}
          </ButtonBase>

          {!isRemoveButtonProStartTrial && (
            <ButtonBase component={Link} to={upgradeButton.link} variant="filled" onClick={trackModalConfirmation}>
              {t(upgradeButton.label)}
            </ButtonBase>
          )}
        </div>
      );
    }
    return (
      <div css={styles.buttonGroup}>
        <ButtonBase to={upgradeButton.link} component={Link} onClick={trackModalConfirmation} fullWidth>
          {isSharedOrGuestUser || currentDocument.isSystemFile ? t('common.upgradeNow') : t(upgradeButton.label)}
        </ButtonBase>
      </div>
    );
  };

  const renderAdminMessages = (canUseProTrial = false) => {
    if (toolName === TOOLS_NAME.MERGE_PAGE) {
      if (canUseProTrial) {
        return t('viewer.leftPanelEditMode.startTrialMerge', {
          limit: MAX_SIZE_MERGE_DOCUMENT.FREE,
        });
      }
      return t('viewer.leftPanelEditMode.upgradeToMerge', {
        limit: MAX_SIZE_MERGE_DOCUMENT.FREE,
      });
    }

    if (canUseProTrial) {
      return t('viewer.freeTrialSevenDays');
    }
    return t('viewer.levelUpToUnlock');
  };

  const renderNormalUserMessages = (isSharedOrGuest = false) => {
    if (toolName === TOOLS_NAME.MERGE_PAGE) {
      if (isSharedOrGuest) {
        return t('viewer.leftPanelEditMode.upgradeToMerge', {
          limit: MAX_SIZE_MERGE_DOCUMENT.FREE,
        });
      }
      return t('viewer.leftPanelEditMode.contactAdminToUseMerge', {
        limit: MAX_SIZE_MERGE_DOCUMENT.FREE,
      });
    }

    if (isSharedOrGuest) {
      return t('viewer.levelUpToUnlock');
    }
    return t('viewer.contactAdministratorToUpgrade', { plan: PLAN_TYPE_LABEL.ORG_PRO });
  };

  const renderPremiumContent = () => {
    const roleInOrg = get(currentDocument, 'documentReference.data.userRole', '').toUpperCase();
    const isAdmin = [ORGANIZATION_ROLES.ORGANIZATION_ADMIN, ORGANIZATION_ROLES.BILLING_MODERATOR].includes(roleInOrg);
    const documentOrgOwner = getOrgOfDoc({
      organizations,
      currentDocument,
    });
    const paymentUtilities = new PaymentUtilities(documentOrgOwner?.payment);
    const isFreeOrg = paymentUtilities.isUnifyFree();
    const isMember = documentOrgOwner?.userRole?.toUpperCase() === ORGANIZATION_ROLES.MEMBER;
    const isFreeOrgMember = isFreeOrg && isMember;
    const isSharedUser = documentOrgOwner ? !isMember && currentDocument.isShared : currentDocument.isShared;
    const isSharedOrGuestUser = isSharedUser || currentDocument.isGuest;
    const { isSystemFile } = currentDocument;
    if (isAdmin || isFreeOrgMember) {
      const trialInfo = get(currentDocument, 'documentReference.data.payment.trialInfo', {});
      return (
        <div css={styles.container}>
          <SvgElement content="icon-three-stars" width={48} height={48} />
          <h5 css={styles.title}>{t('viewer.upgradeToAccess')}</h5>
          <h6 css={styles.message}>{renderAdminMessages(trialInfo.canUseProTrial)}</h6>
          {renderButtonGroup(trialInfo)}
        </div>
      );
    }
    return (
      <div css={styles.container}>
        <SvgElement content="icon-three-stars" width={48} height={48} />
        <h5 css={styles.title}>{t('viewer.upgradeToAccess')}</h5>
        <h6 css={styles.message}>{renderNormalUserMessages(isSharedOrGuestUser || isSystemFile)}</h6>
        {(isSharedOrGuestUser || currentDocument.isSystemFile) && renderButtonGroup({ canUseProTrial: false })}
      </div>
    );
  };

  switch (type) {
    case FEATURE_VALIDATION.LIMIT_FEATURE: {
      return (
        <div css={styles.container}>
          <SvgElement content="icon-three-stars" width={48} height={48} />
          <h5 css={styles.title}>{t('common.featureLimited')}</h5>
          <h6 css={styles.message}>{t('viewer.makeACopy.messageFeatureLimit')}</h6>
          <div className="PopperLimit__btn-group one-column">
            <a href={Routers.DOCUMENTS} target="_blank" rel="noreferrer">
              <ButtonBase fullWidth>{t('common.tryThisFeature')}</ButtonBase>
            </a>
          </div>
        </div>
      );
    }
    case FEATURE_VALIDATION.SIGNIN_REQUIRED: {
      return (
        <div css={styles.container}>
          <SvgElement content="icon-three-stars" width={48} height={48} />
          <h5 css={styles.title}>{t('viewer.makeACopy.signInRequired')}</h5>
          <h6 css={styles.message}>{t('viewer.makeACopy.messageSignInRequired')}</h6>
          <div>
            <ButtonBase onClick={() => authServices.signInInsideViewer(currentDocument)} fullWidth>
              {t('authorizeRequest.signInNow')}
            </ButtonBase>
          </div>
        </div>
      );
    }
    case FEATURE_VALIDATION.PERMISSION_REQUIRED: {
      return (
        <div css={styles.container}>
          <SvgElement content="icon-three-stars" width={48} height={48} />
          <h5 css={styles.title}>{t('viewer.requestPermissionUpModal.permissionRequired')}</h5>
          <h6 css={styles.message}>{t('viewer.fileWarningModal.havePermissionToUseFeature')}</h6>
          <div>
            <ButtonBase onClick={handleOpenModal} fullWidth>
              {t('viewer.fileWarningModal.requestEditAccess')}
            </ButtonBase>
          </div>
        </div>
      );
    }
    case FEATURE_VALIDATION.PREMIUM_FEATURE: {
      return renderPremiumContent();
    }
    default:
      return null;
  }
}

export default PopperLimitContent;
