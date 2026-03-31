import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  getPwdStrengthColors,
  getPasswordStrength,
  letterValidator,
  lowerCaseValidator,
  numberValidator,
  upperCaseValidator,
} from 'utils/password';

import './PasswordStrength.scss';
import { useTranslation } from 'hooks';

const getPasswordStrengthList = ({ t }) => [
  {
    text: t('authenPage.signUp.right.8Letters'),
    validateFunc: letterValidator,
  },
  {
    text: t('authenPage.signUp.right.1Number'),
    validateFunc: numberValidator,
  },
  {
    text: t('authenPage.signUp.right.1UppercaseLetter'),
    validateFunc: upperCaseValidator,
  },
  {
    text: t('authenPage.signUp.right.1LowercaseLetter'),
    validateFunc: lowerCaseValidator,
  },
];

PasswordStrength.propTypes = {
  password: PropTypes.string,
};

PasswordStrength.defaultProps = {
  password: '',
};

function PasswordStrength({ password }) {
  const { t } = useTranslation();
  const strength = getPasswordStrength(password);
  const colorBars = getPwdStrengthColors(strength);

  return (
    <div className="PasswordStrength">
      <div className="PasswordStrength__bar-wrapper">
        {colorBars.map((color, index) => (
          <div key={index} className="PasswordStrength__bar-col">
            <div className="PasswordStrength__bar" style={{ background: color }} />
          </div>
        ))}
      </div>
      <div className="PasswordStrength__requirement">
        <ul className="Requirement__option">
          {getPasswordStrengthList({ t }).map((item, index) => (
            <li key={index} className="Requirement__item">
              <p
                className={classNames('Requirement__text', {
                  'Requirement__text--active': item.validateFunc(password),
                })}
              >
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PasswordStrength;
