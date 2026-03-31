import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';

import actions from 'actions';
import selectors from 'selectors';

import { useGetCurrentUser, useGetReturnToUrl } from 'hooks';

import { organizationServices, userServices } from 'services';

import logger from 'helpers/logger';

import { errorUtils, orgUtil } from 'utils';
import { getDefaultOrgUrl } from 'utils/orgUrlUtils';

import { HUBSPOT_CONTACT_PROPERTIES } from 'constants/hubspotContactProperties';
import { DOMAIN_VISIBILITY_SETTING, ORG_SET_UP_TYPE } from 'constants/organizationConstants';

const FIND_COLLABORATORS = 'FIND_COLLABORATORS';

const useHandleSubmit = ({ setCurrentStep, setCreateOrgData, purpose, setIsLoading, setIsDisableBackButton }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { search } = useLocation();
  const organizationList = useSelector(selectors.getOrganizationList, shallowEqual).data || [];
  const { isPopularDomain } = useGetCurrentUser();
  const { isLuminSign, luminSignDashboardUrl, isAgreementGen, agreementGenUrl } = useGetReturnToUrl();

  const createOrganizationSuccessfully = (createdOrg) => {
    const organizationWithRole = orgUtil.mappingOrgWithRoleAndTeams(createdOrg);
    dispatch(actions.setOrganizations([...organizationList, organizationWithRole]));
  };

  const getValueOfVisibility = (visibility) => {
    if (isPopularDomain) {
      return DOMAIN_VISIBILITY_SETTING.INVITE_ONLY;
    }
    return visibility
      ? DOMAIN_VISIBILITY_SETTING.VISIBLE_AUTO_APPROVE
      : DOMAIN_VISIBILITY_SETTING.VISIBLE_NEED_APPROVE;
  };

  const createOrganization = async ({ orgName, visibility }) => {
    const domainVisibility = getValueOfVisibility(visibility);
    const { organization } = await organizationServices.createOrganization({
      organizationData: {
        name: orgName,
        settings: {
          domainVisibility,
        },
        purpose,
      },
    });
    createOrganizationSuccessfully(organization);
    return organization;
  };

  const handleNewUser = async ({ orgName, visibility }) => {
    const { url } = await createOrganization({ orgName, visibility });
    if (isAgreementGen) {
      window.location.href = agreementGenUrl(url);
      return;
    }

    if (isLuminSign) {
      window.location.href = luminSignDashboardUrl(url);
      return;
    }
    dispatch(actions.updateCurrentUser({ hasJoinedOrg: true, lastAccessedOrgUrl: url }));
    navigate(getDefaultOrgUrl({ orgUrl: url, search }), { replace: true });
  };

  const onSubmit = async ({ orgName, visibility }) => {
    setIsLoading(true);
    setIsDisableBackButton(true);
    try {
      userServices.saveHubspotProperties({
        key: HUBSPOT_CONTACT_PROPERTIES.COMPLETE_NEW_AUTHEN_ORGANIZATION_FLOW,
        value: 'true',
      });

      await handleNewUser({ orgName, visibility });
    } catch (error) {
      const { message } = errorUtils.extractGqlError(error);
      logger.logError({ errorMessage: message, error });
    } finally {
      setIsLoading(false);
      setIsDisableBackButton(false);
    }
  };

  const handleSubmit = async ({ orgName, visibility }) => {
    if (purpose !== ORG_SET_UP_TYPE.PERSONAL) {
      setCurrentStep(FIND_COLLABORATORS);
      setCreateOrgData({
        orgName,
        visibility,
      });
      return;
    }

    await onSubmit({ orgName, visibility });
  };

  return { onSubmit: handleSubmit };
};

export default useHandleSubmit;
