import CircularProgress from '@mui/material/CircularProgress';

interface IProps {
  color?: string;
  size?: number;
}

function Loading({ color, size = 24 }: IProps) {
  return <CircularProgress sx={{ color }} size={size} />;
}

Loading.defaultProps = {
  color: 'inherit',
  size: 20
};

export default Loading;
