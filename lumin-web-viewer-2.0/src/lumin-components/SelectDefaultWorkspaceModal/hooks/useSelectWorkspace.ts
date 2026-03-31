/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { useDispatch } from 'react-redux';
import actions from 'actions';
import { userServices } from 'services';
import { toastUtils } from 'utils';

type Props = {
  shouldSetDefaultWorkspace: boolean;
  setSelectWorkspace: (value: string) => void;
  onSubmit: (value: string) => void;
  selectWorkspace: string;
  message: string;
};

const useSelectWorkspace = ({
  shouldSetDefaultWorkspace,
  setSelectWorkspace,
  onSubmit,
  selectWorkspace = '',
  message,
}: Props): {
  handleRadioChange: (e: React.FormEvent<HTMLInputElement>) => void;
  submitUpdateWorkspace: () => void;
} => {
  const dispatch = useDispatch();
  const submitUpdateDefaultWorkspace = async (orgId: string): Promise<void> => {
    try {
      const user = await userServices.updateDefaultWorkspace(orgId);
      dispatch(actions.updateCurrentUser(user));
      toastUtils.success({ message });
    } catch (error) {
      toastUtils.openUnknownErrorToast();
    }
  };

  const handleRadioChange = (e: React.FormEvent<HTMLInputElement>): void => {
    // @ts-ignore
    const { value } = e.target;
    setSelectWorkspace(value);
  };

  const submitUpdateWorkspace = async (): Promise<void> => {
    onSubmit(selectWorkspace);
    if (shouldSetDefaultWorkspace) {
      await submitUpdateDefaultWorkspace(selectWorkspace);
    }
  };

  return {
    handleRadioChange,
    submitUpdateWorkspace,
  };
};

export default useSelectWorkspace;
