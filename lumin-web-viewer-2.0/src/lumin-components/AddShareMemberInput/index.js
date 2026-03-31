import { withApollo } from '@apollo/client/react/hoc';
import { withStyles } from '@mui/styles';

import AddShareMemberInput from './AddShareMemberInput';

import { styles } from './AddShareMemberInput.styled';

export default withApollo(withStyles(styles)(AddShareMemberInput));
