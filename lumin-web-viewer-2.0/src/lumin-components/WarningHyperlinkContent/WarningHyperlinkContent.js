import PropTypes from 'prop-types';
import React from 'react';

import PlainTooltip from '@new-ui/general-components/Tooltip/PlainTooltip';

import { useTranslation } from 'hooks';

const HYPERLINK_MAX_LENGTH = 50;

const WarningHyperlinkContent = ({ url }) => {
  const { t } = useTranslation();

  const getShortenedUrl = () => {
    const headPart = url.substring(0, 30);
    const tailPart = url.substring(url.length - 17);
    return `${headPart}...${tailPart}`;
  };

  const urlContent = url.length > HYPERLINK_MAX_LENGTH ? getShortenedUrl() : url;

  return (
    <div>
      {t('viewer.leavingLumin.beingRedirected')} <br />
      <PlainTooltip title={url}>
        <div>
          <b className='bold'>{urlContent}</b>
        </div>
      </PlainTooltip>
      {t('viewer.leavingLumin.outSiteOfLumin')}
    </div>
  );
};

WarningHyperlinkContent.propTypes = {
  url: PropTypes.string.isRequired,
};

export default WarningHyperlinkContent;
