import { useEffect, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router';

import selectors from 'selectors';

import { userServices } from 'services';

import { errorUtils } from 'utils';
import { makeCancelable } from 'utils/makeCancelable';

import { NEW_AUTH_FLOW_ROUTE } from 'constants/Routers';

import logger from '../../../helpers/logger';

const useGetSameOrgDomain = () => {
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [orgList, setOrgList] = useState([]);
  useEffect(() => {
    const { promise, cancel } = makeCancelable(userServices.getSuggestedOrgListOfUser);
    const fetchOrgSameDomain = async () => {
      try {
        const orgList = await promise();
        if (orgList.length > 0) {
          setOrgList(orgList);
        } else {
          navigate(NEW_AUTH_FLOW_ROUTE.SET_UP_ORGANIZATION, { replace: true, state: { fromJoinOrgPage: true } });
        }
        setIsLoading(false);
      } catch (error) {
        const { message } = errorUtils.extractGqlError(error);
        logger.logError({ error, message });
        if (!error.isCanceled) {
          setIsLoading(false);
        }
      }
    };
    fetchOrgSameDomain();
    return () => {
      cancel();
    };
  }, [currentUser, navigate]);

  return {
    isLoading,
    orgList,
  };
};

export default useGetSameOrgDomain;
