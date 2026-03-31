import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Link } from 'react-router-dom';

import TeamNotFoundImage from 'assets/images/Team-notfound.svg';

import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { getFullPathWithPresetLang } from 'utils/getLanguage';

import { ORG_TEXT } from 'constants/organizationConstants';
import { TEAMS_TEXT } from 'constants/teamConstant';
import { STATIC_PAGE_URL } from 'constants/urls';

import './TeamNotFound.scss';

const propTypes = {
};
const defaultProps = {
};

const Divider = () => <span className="TeamNotFound__divider">|</span>;

function TeamNotFound() {
  const { t } = useTranslation();
  const { data: currentOrganization } = useSelector(selectors.getCurrentOrganization, shallowEqual);
  const { url } = currentOrganization || {};
  return (
    <div className="TeamNotFound">
      <div>
        <img
          src={TeamNotFoundImage}
          alt="Team Not Found"
          className="TeamNotFound__image"
        />
        <h1>{t('teamNotAvailable.title')}</h1>
        <p>{t('teamNotAvailable.message')}</p>
        <div className="TeamNotFound__groupButton">
          <Link className="TeamNotFound__button" to={`/${ORG_TEXT}/${url}/${TEAMS_TEXT}`}>
            {t('teamNotAvailable.goBack')}
          </Link><br className="hide-in-tablet-up" />
          <Divider />
          <Link className="TeamNotFound__button" to={`/${ORG_TEXT}/${url}/documents/${ORG_TEXT}`}>
            {t('teamNotAvailable.goToDocs')}
          </Link><Divider /><br className="hide-in-tablet-up" />
          <a
            className="TeamNotFound__button"
            href={STATIC_PAGE_URL + getFullPathWithPresetLang('/guide')}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('teamNotAvailable.guide')}
          </a><Divider />
          <a
            className="TeamNotFound__button"
            href={STATIC_PAGE_URL + getFullPathWithPresetLang(t('url.saleSupport.contactSupport'))}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('common.contactUs')}
          </a>
        </div>
      </div>
    </div>
  );
}

TeamNotFound.propTypes = propTypes;
TeamNotFound.defaultProps = defaultProps;

export default TeamNotFound;
