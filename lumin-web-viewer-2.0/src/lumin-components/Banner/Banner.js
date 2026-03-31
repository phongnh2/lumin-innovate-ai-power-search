import { isString } from 'lodash';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';

import BannerContext from 'src/navigation/Router/BannerContext';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Icomoon from 'lumin-components/Icomoon';

import { Colors } from 'constants/styles';

import * as Styled from './Banner.styled';

const Banner = ({ bannerImage, mainTitle, subTitle, buttonContent, onSubmit, onClose, type }) => {
  const { setShowBanner } = useContext(BannerContext);
  const handleClose = (e) => {
    onClose(e);
    setShowBanner({ status: false, type });
  };
  return (
    <Styled.BannerContainer>
      <Styled.Container>
        <Styled.CloseButton onClick={handleClose}>
          <Icomoon className="cancel" size={14} color={Colors.NEUTRAL_60} />
        </Styled.CloseButton>
        <Styled.BannerImage src={bannerImage} />
        <Styled.DescriptionContainer>
          <Styled.Title as={isString(mainTitle) ? 'h2' : 'div'}>{mainTitle}</Styled.Title>
          <Styled.Description hasTitle={subTitle} as={isString(mainTitle) ? 'p' : 'div'}>
            {subTitle}
          </Styled.Description>
          {buttonContent && (
            <Styled.ButtonLink color={ButtonColor.PRIMARY_RED} size={ButtonSize.XS} onClick={onSubmit} fullWidth>
              {buttonContent}
            </Styled.ButtonLink>
          )}
        </Styled.DescriptionContainer>
      </Styled.Container>
    </Styled.BannerContainer>
  );
};

Banner.propTypes = {
  bannerImage: PropTypes.string,
  mainTitle: PropTypes.string,
  subTitle: PropTypes.string,
  buttonContent: PropTypes.string,
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
  type: PropTypes.string.isRequired,
};

Banner.defaultProps = {
  bannerImage: '',
  mainTitle: '',
  subTitle: '',
  buttonContent: '',
  onSubmit: () => {},
  onClose: () => {},
};

export default Banner;
