import { Button } from 'lumin-ui/kiwi-ui';
import React from 'react';

import Icomoon from 'luminComponents/Icomoon';

import { IInlineAlertProps } from './InlineAlert.interface';

import * as Styled from './InlineAlert.styled';

const COLOR_SCHEME_DICT = {
  info: {
    bgColor: 'le_information_information_container',
    color: 'le_information_on_information_container',
  },
  warning: {
    bgColor: 'le_warning_warning_container',
    color: 'le_warning_on_warning_container',
  },
  error: {
    bgColor: 'le_error_error_container',
    color: 'le_error_on_error_container',
  },
};

const InlineAlert = ({
  type = 'info',
  title,
  icon = 'md_status_warning',
  btnTitle,
  onBtnClick = (f) => f,
  extra,
}: IInlineAlertProps): JSX.Element => {
  const { bgColor, color } = COLOR_SCHEME_DICT[type];

  const renderTail = (): JSX.Element => {
    if (extra) {
      return extra;
    }

    if (btnTitle) {
      return (
        <Styled.TailWrapper>
          <Button size="md" colorType={type} variant="filled" onClick={onBtnClick}>
            {btnTitle}
          </Button>
        </Styled.TailWrapper>
      );
    }
  };

  return (
    <Styled.Wrapper $bgColor={bgColor} $color={color}>
      <Styled.MainContentWrapper>
        {icon && (
          <Styled.IconWrapper>
            <Icomoon className={icon} size={24} />
          </Styled.IconWrapper>
        )}

        <Styled.Title>{title}</Styled.Title>
      </Styled.MainContentWrapper>

      {renderTail()}
    </Styled.Wrapper>
  );
};

export default InlineAlert;
