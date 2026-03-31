import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'hooks';
import * as Styled from './FeatureListItem.styled';

const propTypes = {
  data: PropTypes.array,
  featured: PropTypes.bool,
};

const defaultProps = {
  data: [],
  featured: false,
};

const FeatureListItem = ({ data, featured }) => {
  const { t } = useTranslation();

  return (
    <Styled.Container>
      {data.map((item) => (
        <Styled.Item key={item}>
          <Styled.Icon featured={featured} />
          <Styled.Text featured={featured}>{t(item)}</Styled.Text>
        </Styled.Item>
      ))}
    </Styled.Container>
  );
};

FeatureListItem.propTypes = propTypes;
FeatureListItem.defaultProps = defaultProps;

export default FeatureListItem;
