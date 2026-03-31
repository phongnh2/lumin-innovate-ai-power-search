import { PaperProps } from 'lumin-ui/kiwi-ui';

export interface LuminPaperProps extends Omit<PaperProps, 'elevation' | 'rounded'> {
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  rounded?: 'none' | 'small' | 'medium' | 'large';
}
