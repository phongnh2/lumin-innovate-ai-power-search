import { useGetFeatureIsOn } from 'hooks/growthBook/useGetFeatureIsOn';

import { KEY_ATTRIBUTES_GROWTH_BOOK } from 'constants/growthBookConstant';

export const useEnabledFormInGuestMode = () => {
  const { isOn, loading } = useGetFeatureIsOn({
    key: 'edit-documents-without-signing-in',
    attributeToCheckLoading: KEY_ATTRIBUTES_GROWTH_BOOK.ANONYMOUS_USER_ID,
  });
  /**
   * @description use for QC testing
   */
  const enabledInBrowser = localStorage.getItem('flag_form_in_guest_mode') === 'enabled';
  return {
    enabledFormInGuestMode: isOn || enabledInBrowser,
    loading,
  };
};
