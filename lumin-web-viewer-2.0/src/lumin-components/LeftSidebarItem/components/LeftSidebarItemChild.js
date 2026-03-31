import PropTypes from 'prop-types';
import React from 'react';
import { NavLink } from 'react-router-dom';

import Icomoon from 'lumin-components/Icomoon';

import { Colors } from 'constants/styles';

import * as Styled from '../LeftSidebarItem.styled';

const LeftSidebarItemChild = ({
  special,
  active,
  text,
  isCollapseList,
  link,
  nested,
  isDisabled,
  className,
  showUploadDocumentGuide,
  ...otherProps
}) => {
  const ButtonWrapper = nested ? Styled.SecondaryWrapper : React.Fragment;
  const disabled = !active && isDisabled;
  const showDocumentGuide = Boolean(className) && showUploadDocumentGuide;
  return (
    <ButtonWrapper>
      <Styled.ButtonContainerSecondary
        as={link && NavLink}
        to={link}
        $nested={nested}
        $isDisabled={disabled}
        className={className}
        $showDocumentGuide={showDocumentGuide}
        {...otherProps}
      >
        <Styled.ContainerSubItem
          $nested={nested}
          isCollapseList={isCollapseList}
          $showDocumentGuide={showDocumentGuide}
        >
          <Styled.TextName isHighlight={special} active={active} $showDocumentGuide={showDocumentGuide}>
            {text}
          </Styled.TextName>
          <Icomoon className="check" size={12} style={{ marginLeft: 4 }} color={Colors.PRIMARY_90} />
        </Styled.ContainerSubItem>
      </Styled.ButtonContainerSecondary>
    </ButtonWrapper>
  );
};

LeftSidebarItemChild.propTypes = {
  special: PropTypes.bool,
  active: PropTypes.bool,
  text: PropTypes.node,
  isCollapseList: PropTypes.bool,
  link: PropTypes.string,
  nested: PropTypes.bool,
  isDisabled: PropTypes.bool,
  className: PropTypes.string,
  showUploadDocumentGuide: PropTypes.bool,
};
LeftSidebarItemChild.defaultProps = {
  special: false,
  active: false,
  text: '',
  isCollapseList: false,
  link: '',
  nested: false,
  isDisabled: false,
  className: '',
  showUploadDocumentGuide: false,
};

export default LeftSidebarItemChild;
