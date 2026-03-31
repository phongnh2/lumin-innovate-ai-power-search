import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';

import Icomoon from 'lumin-components/Icomoon';
import { Colors } from 'constants/styles';
import Tooltip from 'lumin-components/Shared/Tooltip';

import * as Styled from '../LeftSidebarItem.styled';

const LeftSidebarItemParent = ({
  active,
  onCollapseListClick,
  isLastItem,
  link,
  className,
  isCollapseList,
  iconName,
  special,
  text,
  isOpen,
  arrowTooltip,
  color,
  nested,
  isDisabled,
}) => {
  const ButtonWrapper = nested ? Styled.PrimaryWrapper : React.Fragment;
  const disabled = !active && isDisabled;
  return (
    <ButtonWrapper>
      <Styled.ButtonContainerPrimary
        as={link && NavLink}
        $isActive={active}
        $isLastItem={isLastItem}
        onClick={onCollapseListClick}
        to={link}
        className={classNames(className, { active })}
        $nested={nested}
        $isDisabled={disabled}
      >
        <Styled.Container
          active={active}
          isCollapseList={isCollapseList}
          $nested={nested}
        >
          {!nested && (
            <Icomoon
              className={iconName}
              size={16}
              color={special ? Colors.SECONDARY_50 : ''}
            />
          )}
          <Styled.TextName isHighlight={special} active={active}>
            {text}
          </Styled.TextName>
          {isCollapseList && (
            <Tooltip
              title={!isOpen ? arrowTooltip.open : arrowTooltip.close}
              placement="top"
            >
              <Styled.ArrowContainer isOpen={isOpen}>
                <Icomoon className="dropdown" size={10} color={color} />
              </Styled.ArrowContainer>
            </Tooltip>
          )}
        </Styled.Container>
      </Styled.ButtonContainerPrimary>
    </ButtonWrapper>
  );
};

LeftSidebarItemParent.propTypes = {
  special: PropTypes.bool,
  className: PropTypes.string,
  link: PropTypes.string,
  iconName: PropTypes.string,
  text: PropTypes.string.isRequired,
  isCollapseList: PropTypes.bool,
  active: PropTypes.bool,
  arrowTooltip: PropTypes.object,
  isLastItem: PropTypes.bool,
  onCollapseListClick: PropTypes.func,
  isOpen: PropTypes.bool,
  color: PropTypes.string,
  nested: PropTypes.bool,
  isDisabled: PropTypes.bool,
};

LeftSidebarItemParent.defaultProps = {
  special: false,
  className: '',
  link: '/',
  iconName: '',
  isCollapseList: false,
  active: false,
  arrowTooltip: {
    open: null,
    close: null,
  },
  isLastItem: false,
  onCollapseListClick: () => {},
  isOpen: false,
  color: '',
  nested: false,
  isDisabled: false,
};

export default LeftSidebarItemParent;
