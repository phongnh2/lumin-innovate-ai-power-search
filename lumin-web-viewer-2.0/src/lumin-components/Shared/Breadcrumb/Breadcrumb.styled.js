import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

import { Breadcrumbs as MaterialBreadcrumbs } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Colors } from 'constants/styles';

export const Breadcrumbs = withStyles({
  root: {
    width: '100%',
  },
  ol: {
    flexWrap: 'nowrap',
  },
  li: {
    '&:last-child': {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  },
  separator: {
    margin: 0,
  },
})(MaterialBreadcrumbs);

export const BreadcrumbItem = styled(Link)`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  ${(props) => props.$disabled && css`
    pointer-events: none;
  `};
`;

export const ActiveItem = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  cursor: default;
`;
