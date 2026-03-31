import { Text, Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Trans } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import JoinYourOrganization from 'assets/images/join-organization-successfully.png';
import SuccessfullyImage from 'assets/reskin/images/successfully.png';

import actions from 'actions';

import { ButtonSize } from 'lumin-components/ButtonMaterial';

import { useTranslation, useGetReturnToUrl } from 'hooks';

import { authServices } from 'services';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { getDefaultOrgUrl, getTrendingUrl } from 'utils/orgUrlUtils';

import { ORG_TEXT } from 'constants/organizationConstants';
import { Routers } from 'constants/Routers';

import * as Styled from './JoinOrganizationSuccessfully.styled';

import styles from './JoinOrganizationSuccessfully.module.scss';

const JoinOrganizationSuccessfully = ({ organization, isReskin }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLuminSign, luminSignDashboardUrl, isAgreementGen, agreementGenUrl } = useGetReturnToUrl();
  const { url, name } = organization;

  const handleOnClick = async ({ link, openUploadFileDialog = false, href }) => {
    if (href) {
      window.location.href = href;
      return;
    }
    dispatch(actions.updateCurrentUser({ hasJoinedOrg: true }));
    await authServices.updateOrganizationList();
    if (link) {
      if (openUploadFileDialog) {
        navigate(`${link}${link.includes('?') ? '&' : '?'}openUploadFileDialog=true`);
        return;
      }
      navigate(link);
    }
  };

  const data = useMemo(() => {
    if (isAgreementGen) {
      return {
        descriptionKey: 'joinOrg.agreementGenDescriptionSuccessYouReIn',
        primaryButtonTitle: t('common.getStarted'),
        primaryButtonProps: {
          onClick: () => handleOnClick({ href: agreementGenUrl(url) }),
        },
      };
    }

    if (isLuminSign) {
      const exploreLuminUrl = url ? `/${ORG_TEXT}/${url}/home` : Routers.ROOT;
      return {
        descriptionKey: 'joinOrg.signOrExploreLumin',
        secondaryButtonProps: {
          onClick: () => handleOnClick({ link: exploreLuminUrl }),
        },
        secondaryButtonTitle: t('joinOrg.exploreLumin'),
        primaryButtonProps: {
          onClick: () => handleOnClick({ href: luminSignDashboardUrl(url) }),
        },
        primaryButtonTitle: t('joinOrg.signAnAgreement'),
      };
    }

    return {
      descriptionKey: 'joinOrg.descriptionSuccessYouReIn',
      secondaryButtonTitle: t('joinOrg.uploadDocument'),
      secondaryButtonProps: {
        onClick: () => handleOnClick({ link: getDefaultOrgUrl({ orgUrl: url }), openUploadFileDialog: true }),
        'data-lumin-btn-name': ButtonName.ON_BOARDING_ORGANIZATION_UPLOAD_DOCUMENTS,
      },
      primaryButtonTitle: t('joinOrg.browseDocuments'),
      primaryButtonProps: {
        onClick: () => handleOnClick({ link: getTrendingUrl({ orgUrl: url }) }),
        'data-lumin-btn-name': ButtonName.ON_BOARDING_ORGANIZATION_BROWSE_DOCUMENTS,
      },
    };
  }, [isLuminSign, isAgreementGen]);

  if (isReskin) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <img className={styles.img} src={SuccessfullyImage} alt="successfully" />
          <div className={styles.contentWrapper}>
            <Text type="headline" size="xl" color="var(--kiwi-colors-surface-on-surface)">
              {t('joinOrg.successYouReIn')}
            </Text>
            <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
              <Trans
                i18nKey={data.descriptionKey}
                values={{
                  name,
                }}
                components={{
                  b: (
                    <b
                      style={{
                        fontWeight: 700,
                      }}
                    />
                  ),
                }}
              />
            </Text>
          </div>
          <div className={styles.actions}>
            {data.secondaryButtonTitle && (
              <Button variant="outlined" size="lg" {...data.secondaryButtonProps}>
                {data.secondaryButtonTitle}
              </Button>
            )}
            <Button variant="filled" size="lg" {...data.primaryButtonProps}>
              {data.primaryButtonTitle}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Styled.Wrapper>
      <Styled.Container>
        <Styled.Title>{t('joinOrg.successYouReIn')}</Styled.Title>
        <Styled.Description>
          <Trans
            i18nKey="joinOrg.descriptionSuccessYouReIn"
            values={{
              name,
            }}
            components={{
              b: (
                <b
                  style={{
                    fontWeight: 700,
                  }}
                />
              ),
            }}
          />
        </Styled.Description>
        <Styled.ButtonWrapper>
          <Styled.Button
            onClick={() => handleOnClick({ link: getTrendingUrl({ orgUrl: url }) })}
            size={ButtonSize.XL}
            data-lumin-btn-name={ButtonName.ON_BOARDING_ORGANIZATION_BROWSE_DOCUMENTS}
          >
            {t('joinOrg.browseDocuments')}
          </Styled.Button>
          <Styled.Link
            replace
            to={getDefaultOrgUrl({ orgUrl: url })}
            onClick={() => handleOnClick({ link: getDefaultOrgUrl({ orgUrl: url }), openUploadFileDialog: true })}
            data-lumin-btn-name={ButtonName.ON_BOARDING_ORGANIZATION_UPLOAD_DOCUMENTS}
          >
            {t('joinOrg.uploadDocument')}
          </Styled.Link>
        </Styled.ButtonWrapper>
        <Styled.Image src={JoinYourOrganization} alt="join organization succesfully" />
      </Styled.Container>
    </Styled.Wrapper>
  );
};

JoinOrganizationSuccessfully.propTypes = {
  organization: PropTypes.object.isRequired,
  isReskin: PropTypes.bool,
};

JoinOrganizationSuccessfully.defaultProps = {
  isReskin: false,
};

export default JoinOrganizationSuccessfully;
