import { PlainTooltip, Button, ButtonColorType } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useSelector } from 'react-redux';
import { useMedia } from 'react-use';

import IconButton from '@new-ui/general-components/IconButton';

import selectors from 'selectors';

import SvgElement from 'lumin-components/SvgElement';

import { Breakpoints } from 'constants/styles';

import * as Styled from './Banner.styled';

type BannerType = {
  classProp: string;
  titleClassname?: string;
  title: string;
  btnClassName?: string;
  btnData: {
    btnContent: string;
    btnName: string;
    btnPurpose: string;
    disabled?: boolean;
    tooltip?: string;
    loading?: boolean;
    backgroundColor?: string;
    btnDirectTo?: string;
    btnDirectToNewTab?: boolean;
  };
  onClickBannerLink: () => void;
  onClickCloseBanner: () => void;
  type: ButtonColorType;
  hasStartIcon?: boolean;
  startIcon?: {
    content?: string;
    width?: number;
    height?: number;
  };
  backgroundColor?: string;
  color?: string;
};

const Banner = React.forwardRef<HTMLDivElement, BannerType>(
  (
    {
      title,
      btnData,
      onClickBannerLink,
      onClickCloseBanner,
      type,
      btnClassName,
      hasStartIcon = true,
      startIcon = {
        content: 'icon-three-stars',
        width: 24,
        height: 24,
      },
      backgroundColor,
      color,
    },
    ref
  ) => {
    const {
      btnName,
      btnPurpose,
      btnContent,
      disabled = false,
      tooltip = '',
      loading = false,
      backgroundColor: btnBackgroundColor,
      btnDirectTo,
      btnDirectToNewTab,
    } = btnData;
    const isMobile = useMedia(`(max-width: ${Breakpoints.sm}px)`);
    const isInPresenterMode = useSelector(selectors.isInPresenterMode);

    if (isInPresenterMode) {
      return null;
    }

    return (
      <Styled.BannerWrapper ref={ref} type={type} {...(backgroundColor && { style: { backgroundColor } })}>
        <Styled.BannerInner>
          <Styled.BannerContent>
            <Styled.BannerMessage type={type}>
              {hasStartIcon && (
                <Styled.BannerStatusIconWrapper>
                  {typeof startIcon === 'object' && !React.isValidElement(startIcon) ? <SvgElement {...startIcon} /> : startIcon}
                </Styled.BannerStatusIconWrapper>
              )}
              <span style={{ color }}>{title}</span>
            </Styled.BannerMessage>
            <PlainTooltip content={tooltip} position="bottom" maw={270}>
              <span>
                <Button
                  className={btnClassName}
                  onClick={onClickBannerLink}
                  colorType={type}
                  size="md"
                  variant="filled"
                  fullWidth={isMobile}
                  style={{ flexShrink: 0, width: 'fit-content' }}
                  disabled={disabled}
                  loading={loading}
                  {...(btnName && { 'data-lumin-btn-name': btnName })}
                  {...(btnPurpose && { 'data-lumin-btn-purpose': btnPurpose })}
                  {...(btnBackgroundColor && { styles: { root: { background: btnBackgroundColor } } })}
                  {...(btnDirectTo && { href: btnDirectTo, component: 'a' })}
                  {...(btnDirectToNewTab && { target: '_blank' })}
                >
                  {btnContent}
                </Button>
              </span>
            </PlainTooltip>
          </Styled.BannerContent>
          <Styled.BannerCloseIcon>
            <IconButton onClick={onClickCloseBanner} icon="cancel" />
          </Styled.BannerCloseIcon>
        </Styled.BannerInner>
      </Styled.BannerWrapper>
    );
  }
);

export default Banner;
