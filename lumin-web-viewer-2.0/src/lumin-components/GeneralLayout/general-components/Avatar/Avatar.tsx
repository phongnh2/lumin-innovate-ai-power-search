import MuiAvatar, { AvatarOwnProps } from '@mui/material/Avatar';
import React, { Ref } from 'react';
import { useTheme } from 'styled-components';

import SvgElement from 'luminComponents/SvgElement';

import { hashColorFromUserName } from 'utils';

import { AvatarSize, MappingStyleBySize } from './Avatar.types';

import * as Styled from './Avatar.styled';

interface ICustomAvatarProps {
  size: AvatarSize;
  outline: boolean;
}

type IProps = AvatarOwnProps & ICustomAvatarProps;

const Avatar = React.forwardRef(({ size, outline, children, ...props }: IProps, ref: Ref<HTMLDivElement>) => {
  const backgroundColor = typeof children === 'string' && hashColorFromUserName(children);
  const theme = useTheme() as Record<string, string>;
  const classes = Styled.useStyles({ theme, $size: size, $outline: outline, $backgroundColor: backgroundColor });

  return (
    <MuiAvatar ref={ref} classes={classes} {...props}>
      {children || <SvgElement content="anonymous-avatar" width={MappingStyleBySize[size]} />}
    </MuiAvatar>
  );
});

export default Avatar;
