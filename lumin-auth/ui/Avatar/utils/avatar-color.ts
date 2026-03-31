import { Colors } from '@/ui/theme';

const DEFAULT_AVATAR_COLORS = [
  Colors.SECONDARY_50,
  Colors.OTHER_3,
  Colors.OTHER_2,
  Colors.SUCCESS_50,
  Colors.WARNING_50,
  Colors.PRIMARY_60,
  Colors.PRIMARY_80,
  Colors.PERSIAN_PINK
];

export const hashColorFromUserName = (userName: string) => {
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash += userName.charCodeAt(i);
  }
  const indexOfColor = hash % 8;
  return DEFAULT_AVATAR_COLORS[indexOfColor];
};
