import { useEffect, useState } from 'react';

import { useGetCurrentOrganization } from 'hooks';
import { useTranslation } from 'hooks/useTranslation';

import { developerApiServices } from 'services/developerApiServices';

import { toastUtils } from 'utils';

import { OrganizationRoles } from 'constants/organization.enum';

const useAccountCallback = () => {
  const { t } = useTranslation();
  const [errorText, setErrorText] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialCallbackUrl, setInitialCallbackUrl] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const currentOrganization = useGetCurrentOrganization();

  const getCallbackUrl = async () => {
    try {
      const callbackUrlData = await developerApiServices.getCallbackUrl(currentOrganization._id);
      setCallbackUrl(callbackUrlData);
      setInitialCallbackUrl(callbackUrlData);
      setIsFetching(false);
      return callbackUrlData;
    } catch (error) {
      setIsFetching(false);
    }
  };

  const changeAccountCallback = async () => {
    try {
      setIsSubmitting(true);
      await developerApiServices.changeAccountCallback({
        callbackUrl,
        workspaceId: currentOrganization._id,
      });
      toastUtils.success({ message: t('developerApi.changeAccountCallbackSuccess') }).catch(() => {});
      setInitialCallbackUrl(callbackUrl);
    } catch (error) {
      setErrorText(t('developerApi.changeAccountCallbackError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChangeCallbackUrl = (newCallbackUrl: string) => {
    setCallbackUrl(newCallbackUrl);
    setErrorText('');
  };

  const canCreateAccountCallback = currentOrganization.userRole === OrganizationRoles.ORGANIZATION_ADMIN;

  useEffect(() => {
    getCallbackUrl();
  }, []);

  return {
    errorText,
    isFetching,
    isSubmitting,
    getCallbackUrl,
    changeAccountCallback,
    callbackUrl,
    onChangeCallbackUrl,
    initialCallbackUrl,
    canCreateAccountCallback,
  };
};

export default useAccountCallback;
