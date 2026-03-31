import PropTypes from 'prop-types';
import React from 'react';

import Icomoon from 'lumin-components/Icomoon';
import Tooltip from 'lumin-components/Shared/Tooltip';

import { Colors } from 'constants/styles';

import * as Styled from './Breadcrumb.styled';

function Breadcrumb({ data }) {
  return (
    <Styled.Breadcrumbs
      separator={
        <Icomoon
          className="arrow-right-alt"
          size={10}
          style={{ margin: '0 8px', transform: 'translateY(1px)' }}
          color={Colors.NEUTRAL_80}
        />
      }
    >
      {data.map(({ title, url, disabled, tooltip }, idx) => (idx < data.length - 1 ? (
        <Styled.BreadcrumbItem key={idx} to={url} $disabled={disabled}>
          {title}
        </Styled.BreadcrumbItem>
      ) : (
        <Tooltip key={idx} title={tooltip} placement="bottom-start">
          <Styled.ActiveItem>{title}</Styled.ActiveItem>
        </Tooltip>
      )))}
    </Styled.Breadcrumbs>
  );
}

Breadcrumb.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
  })).isRequired,
};

export default Breadcrumb;
