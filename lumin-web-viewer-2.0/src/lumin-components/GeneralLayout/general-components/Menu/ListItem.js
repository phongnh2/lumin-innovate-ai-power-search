import MuiMenuItem from '@mui/material/ListItem';
import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from 'styled-components';

import * as Styled from './Menu.styled';

const ListItem = React.forwardRef(
  ({ renderSuffix, renderPrefix, disabled, headline, secondaryHeadline, desc, inheritFont, ...otherProps }, ref) => {
    const theme = useTheme();
    const classes = Styled.useListItemStyle({ theme });
    return (
      <MuiMenuItem {...otherProps} disabled={disabled} classes={classes} ref={ref}>
        {renderPrefix && <Styled.PrefixWrapper>{renderPrefix({ disabled })}</Styled.PrefixWrapper>}
        <Styled.ListItemContentWrapper $withPrefix={!!renderPrefix} $withSuffix={!!renderSuffix}>
          <Styled.ListItemTitle $inheritFont={inheritFont}>
            <Styled.ListItemHeadline>{headline}</Styled.ListItemHeadline>

            {secondaryHeadline && (
              <Styled.ListItemSecondaryHeadline>&#40;{secondaryHeadline}&#41;</Styled.ListItemSecondaryHeadline>
            )}
          </Styled.ListItemTitle>

          {desc && <Styled.ListItemDesc>{desc}</Styled.ListItemDesc>}
        </Styled.ListItemContentWrapper>
        {renderSuffix && <Styled.SuffixWrapper>{renderSuffix({ disabled })}</Styled.SuffixWrapper>}
      </MuiMenuItem>
    );
  }
);

ListItem.propTypes = {
  headline: PropTypes.string.isRequired,
  secondaryHeadline: PropTypes.string,
  desc: PropTypes.string.isRequired,
  renderSuffix: PropTypes.func,
  renderPrefix: PropTypes.func,
  disabled: PropTypes.bool,
  inheritFont: PropTypes.bool,
};

ListItem.defaultProps = {
  secondaryHeadline: false,
  renderSuffix: null,
  renderPrefix: null,
  disabled: false,
  inheritFont: false,
};

const { ListItemBaseWrapper } = Styled;

export default ListItem;
export { ListItemBaseWrapper };
