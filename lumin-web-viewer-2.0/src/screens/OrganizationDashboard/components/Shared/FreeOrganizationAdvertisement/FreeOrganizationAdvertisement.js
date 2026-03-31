import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Spring, config } from 'react-spring';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';

import { useTranslation } from 'hooks';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import {
  StyledContainer,
  StyledDescription,
  StyledHeader,
  StyledFeaturesContainer,
  StyledFeatureCard,
  StyledFeatureImage,
  StyledFeatureText,
  StyledFeatureCardContainer,
  StyledButtonList,
  StyledLink,
  StyledButtonLink,
  StyledImageSecurity,
} from './FreeOrganizationAdvertisement.styled';

const propTypes = {
  header: PropTypes.string,
  description: PropTypes.node,
  features: PropTypes.arrayOf(PropTypes.shape({
    image: PropTypes.string,
    description: PropTypes.string,
  })),
  learnMoreUrl: PropTypes.string,
  upgradeUrl: PropTypes.string,
  buttonName: PropTypes.string,
  buttonPurpose: PropTypes.string,
  isSecurityTab: PropTypes.bool,
};
const defaultProps = {
  header: '',
  description: '',
  features: [],
  learnMoreUrl: '',
  upgradeUrl: '',
  buttonName: '',
  buttonPurpose: '',
  isSecurityTab: false,
};

const DELAY_TIME = 100;

function FreeOrganizationAdvertisement({
  header,
  description,
  features,
  learnMoreUrl,
  upgradeUrl,
  buttonName,
  buttonPurpose,
  isSecurityTab,
}) {
  const { t } = useTranslation();

  const renderFeatures = () => {
    if (!features || !features.length) {
      return null;
    }

    if (isSecurityTab) {
      return (
        <StyledFeaturesContainer>
          <StyledImageSecurity src={features[0].image} />
        </StyledFeaturesContainer>
      );
    }

    return (
      <StyledFeaturesContainer>
        {features.map((feature, index) => (
          <Spring
            key={index}
            from={{ opacity: 0, transform: 'translateY(30px)' }}
            to={{ opacity: 1, transform: 'translateY(0)' }}
            config={{ ...config.stiff, delay: DELAY_TIME * (index + 1) }}
          >
            {(styles) => (
              <StyledFeatureCardContainer key={feature.id}>
                <StyledFeatureCard style={styles}>
                  <StyledFeatureImage index={index} src={feature.image} />
                  <StyledFeatureText>{t(feature.description)}</StyledFeatureText>
                </StyledFeatureCard>
              </StyledFeatureCardContainer>
            )}
          </Spring>
        ))}
      </StyledFeaturesContainer>
    );
  };
  return (
    <StyledContainer>
      <StyledHeader>{header}</StyledHeader>
      <StyledDescription isSecurityTab={isSecurityTab}>{description}</StyledDescription>
      {renderFeatures()}
      <Spring
        from={{ opacity: 0, transform: 'translateY(50px)' }}
        to={{ opacity: 1, transform: 'translateY(0)' }}
        config={{ ...config.stiff, delay: DELAY_TIME * features.length }}
      >
        {(styles) => (
          <StyledButtonList style={styles} isSecurityTab={isSecurityTab}>
            <StyledButtonLink
              size={ButtonSize.XL}
              data-lumin-btn-name={buttonName}
              data-lumin-btn-purpose={buttonPurpose}
              to={upgradeUrl}
              component={Link}
            >
              {t('common.upgradeNow')}
            </StyledButtonLink>
            <StyledLink
              to={learnMoreUrl}
              data-lumin-btn-name={ButtonName.ORGANIZATION_PLAN_LEARN_MORE}
              data-lumin-btn-purpose={ButtonPurpose[ButtonName.ORGANIZATION_PLAN_LEARN_MORE]}
            >
              {t('common.learnMore')}
            </StyledLink>
          </StyledButtonList>
        )}
      </Spring>
    </StyledContainer>
  );
}

FreeOrganizationAdvertisement.propTypes = propTypes;
FreeOrganizationAdvertisement.defaultProps = defaultProps;

export default FreeOrganizationAdvertisement;
