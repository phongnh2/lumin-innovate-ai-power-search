import MuiModal from '@mui/material/Dialog';
import i18n from 'i18next';
import { isString } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useTheme } from 'styled-components';

import Checkbox from '@new-ui/general-components/Checkbox';
import IconButton from '@new-ui/general-components/IconButton';
import Paper from '@new-ui/general-components/Paper';

import { ModalPriority } from 'constants/styles/Modal';

import * as Styled from './Modal.styled';

const ModalPaper = React.forwardRef((props, ref) => (
  <Paper ref={ref} {...props} elevation={props.elevation} rounded="large" />
));

ModalPaper.propTypes = {
  elevation: PropTypes.number.isRequired,
};

const buttonSizeMapping = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
  'extra-large': 'xl',
};

const transformButtonProps = ({ isLoading, ...buttonProps } = {}) => ({
  ...buttonProps,
  size: buttonSizeMapping[buttonProps?.size || 'large'],
  loading: isLoading,
});

// https://www.figma.com/file/eGKv7aXCYTxVgaeOeMGJu6/WIP-004_Lumin_Editor_Component_Library?type=design&node-id=2173-108958&mode=dev
const BTN_VARIANT_MAPPING = {
  variant1: ['outlined', 'filled'],
  variant2: ['text', 'text'],
  variant3: ['text', 'tonal'],
  variant4: ['text', 'filled'],
};

/**
 *
 * @param {{
 *  size: "medium" | "small" | "large" | "extra-large";
 *  footerVariant: "variant1" | "variant2" | "variant3" | "variant4";
 * }} props
 *
 */
const Modal = React.forwardRef(
  (
    {
      open,
      size,
      onClose,
      children,
      icon,
      center,
      // NOTE header
      header,
      showCloseIcon,
      title,
      // --- //

      // NOTE footer
      footer,
      primaryButtonProps: deprecatedPrimaryButtonProps,
      secondaryButtonProps: deprecatedSecondaryButtonProps,
      primaryText,
      onPrimaryClick,
      secondaryText,
      onSecondaryClick,
      footerVariant,
      // NOTE content
      content,

      // NOTE checkbox content
      checkboxMessage,
      setIsChecked,
      elevation,
      priority,
      TransitionProps,
      PaperProps,
      ...props
    },
    ref
  ) => {
    const primaryButtonProps = transformButtonProps(deprecatedPrimaryButtonProps);
    const secondaryButtonProps = transformButtonProps(deprecatedSecondaryButtonProps);
    const theme = useTheme();
    const classes = Styled.useStyles({ theme, $size: size, priority });

    const renderIcon = () => {
      if (!icon) {
        return null;
      }

      if (isString(icon)) {
        return <Styled.Icon src={icon} alt={title} />;
      }
      return icon;
    };

    const renderHeader = ({ title, showCloseIcon }) => {
      if (header) {
        return <Styled.BaseHeader $center={center}>{header}</Styled.BaseHeader>;
      }

      if (title || showCloseIcon) {
        return (
          <Styled.Header $center={center}>
            {renderIcon()}
            {title && <Styled.Title $size={size}>{title}</Styled.Title>}

            {showCloseIcon && (
              <Styled.CloseButtonWrapper>
                <IconButton onClick={onClose} icon="md_close" size="large" iconSize={24} />
              </Styled.CloseButtonWrapper>
            )}
          </Styled.Header>
        );
      }

      return null;
    };

    const renderFooter = () => {
      if (footer) {
        return <Styled.BaseFooter>{footer}</Styled.BaseFooter>;
      }

      const btnVariants = BTN_VARIANT_MAPPING[footerVariant];
      if (btnVariants) {
        const baseBtnProps = {
          size: 'lg',
        };

        const primaryBtnProps = {
          ...baseBtnProps,
          ...primaryButtonProps,
          onClick: onPrimaryClick,
          variant: btnVariants[1],
        };

        const secondaryBtnProps = {
          ...baseBtnProps,
          ...secondaryButtonProps,
          onClick: onSecondaryClick,
          variant: btnVariants[0],
        };

        if (!primaryText && !secondaryText) {
          return null;
        }

        return (
          <Styled.Footer>
            {secondaryText && <Styled.SecondaryBtn {...secondaryBtnProps}>{secondaryText}</Styled.SecondaryBtn>}
            {primaryText && <Styled.PrimaryBtn {...primaryBtnProps}>{primaryText}</Styled.PrimaryBtn>}
          </Styled.Footer>
        );
      }

      return null;
    };

    const onCheckboxChange = (e) => {
      const { checked } = e.target;
      if (checkboxMessage) {
        setIsChecked(checked);
      }
    };

    const renderCheckboxContent = () =>
      checkboxMessage.length ? (
        <Styled.CheckboxWrapper $size={size}>
          <Checkbox onChange={onCheckboxChange} />
          <span>{checkboxMessage}</span>
        </Styled.CheckboxWrapper>
      ) : null;

    useEffect(
      () => () => {
        if (open) {
          TransitionProps?.onExited?.();
        }
      },
      [open]
    );

    if (!open) {
      return null;
    }

    return (
      <MuiModal
        ref={ref}
        classes={classes}
        onClose={onClose}
        PaperProps={{
          elevation,
          ...PaperProps,
        }}
        PaperComponent={ModalPaper}
        open={open}
        TransitionProps={TransitionProps}
        {...props}
        disableEnforceFocus
      >
        {renderHeader({ title, showCloseIcon, header })}
        <Styled.Body $center={center}>
          {children}
          {isString(content) ? <Styled.Description>{content}</Styled.Description> : content}
          {renderCheckboxContent()}
        </Styled.Body>
        {renderFooter()}
      </MuiModal>
    );
  }
);

Modal.propTypes = {
  open: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'extra-large']),
  title: PropTypes.string,
  showCloseIcon: PropTypes.bool,
  children: PropTypes.any,
  header: PropTypes.node,
  onClose: PropTypes.func,
  footer: PropTypes.element,
  primaryText: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onPrimaryClick: PropTypes.func,
  secondaryText: PropTypes.string,
  onSecondaryClick: PropTypes.func,
  footerVariant: PropTypes.oneOf(['variant1', 'variant2', 'variant3', 'variant4']),
  checkboxMessage: PropTypes.string,
  setIsChecked: PropTypes.func,
  content: PropTypes.oneOf([PropTypes.element, PropTypes.string]),
  primaryButtonProps: PropTypes.object,
  secondaryButtonProps: PropTypes.object,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  /**
   * Center the modal content
   */
  center: PropTypes.bool,
  elevation: PropTypes.number,
  TransitionProps: PropTypes.object,
  priority: PropTypes.oneOf(Object.values(ModalPriority)),
  PaperProps: PropTypes.object,
};

Modal.defaultProps = {
  open: false,
  size: 'medium',
  title: null,
  showCloseIcon: false,
  children: null,
  header: null,
  onClose: (f) => f,
  footer: undefined,
  primaryText: i18n.t('action.ok'),
  onPrimaryClick: (f) => f,
  secondaryText: i18n.t('action.cancel'),
  onSecondaryClick: (f) => f,
  footerVariant: 'variant1',
  checkboxMessage: '',
  setIsChecked: (f) => f,
  content: null,
  primaryButtonProps: undefined,
  secondaryButtonProps: undefined,
  icon: null,
  center: false,
  elevation: 3,
  TransitionProps: undefined,
  priority: ModalPriority.MEDIUM,
  PaperProps: {},
};

export default Modal;
