import React from 'react';
import { css } from 'styled-components';
import PropTypes from 'prop-types';
import * as Styled from '../../SettingSection.styled';

function BaseItem({
  title,
  text,
  rightElement,
  children,
}) {
  const renderContent = () => {
    const child = (
      <>
        {title && <Styled.ItemTitle>{title}</Styled.ItemTitle>}
        {text && <Styled.ItemText>{text}</Styled.ItemText>}
        {children}
      </>
    );
    if (!rightElement) {
      return child;
    }
    return (
      <div css={css`
        flex: 1;
        margin-right: 12px;
      `}
      >
        {child}
      </div>
    );
  };

  return (
    <Styled.ItemLayout $hasRightElement={Boolean(rightElement)}>
      {renderContent()}
      {rightElement}
    </Styled.ItemLayout>
  );
}

BaseItem.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  rightElement: PropTypes.node,
  children: PropTypes.node,
};
BaseItem.defaultProps = {
  title: null,
  text: null,
  rightElement: null,
  children: null,
};

export default BaseItem;
