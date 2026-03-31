import { makeStyles } from '@mui/styles';
import { AvatarSize, MappingStyleBySize } from './Avatar.types';
import { hashColorFromUserName } from 'utils';

export const useStyles = makeStyles({
  root: ({ theme, $size, $outline, $backgroundColor }: {
    theme: any;
    $size: AvatarSize;
    $outline: boolean;
    $backgroundColor?: string;
  }) => ({
    width: `${MappingStyleBySize[$size]}px`,
    height: `${MappingStyleBySize[$size]}px`,
    backgroundColor: $backgroundColor,
    border: `1px solid ${$outline ? theme.le_main_outline_variant : 'transparent'}`
  }),
});
