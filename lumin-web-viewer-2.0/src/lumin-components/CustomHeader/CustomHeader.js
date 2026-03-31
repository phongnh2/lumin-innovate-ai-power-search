import PropTypes from 'prop-types';
import React from 'react';
import { Helmet } from 'react-helmet';

import { useGetMetaTitle } from 'hooks';

import { getLanguage } from 'utils/getLanguage';

const propTypes = {
  noIndex: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  sharable: PropTypes.bool,
  metaTitle: PropTypes.string,
  suffix: PropTypes.string,
};

const defaultProps = {
  noIndex: false,
  title: '',
  description: '',
  sharable: false,
  metaTitle: '',
  suffix: '',
};
const CustomHeader = ({ noIndex, title, description, sharable, metaTitle, suffix }) => {
  const language = getLanguage();
  const { getMetaTitle } = useGetMetaTitle();

  return (
    <Helmet>
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {description && <meta name="description" language={language} content={description} />}
      {metaTitle && <meta name="title" content={getMetaTitle(metaTitle || title, '', suffix)} />}
      {title && <title>{getMetaTitle(title, '', suffix)}</title>}
      {sharable && <meta property="og:image" content={`${window.location.origin}/assets/images/app-thumbnail.png`} />}
    </Helmet>
  );
};

CustomHeader.propTypes = propTypes;
CustomHeader.defaultProps = defaultProps;

export default CustomHeader;
