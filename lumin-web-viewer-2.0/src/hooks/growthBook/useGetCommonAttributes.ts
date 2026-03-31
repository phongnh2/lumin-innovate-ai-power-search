import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import { cookieManager } from 'helpers/cookieManager';

import { getFullLanguageFromBrowser } from 'utils/getLanguage';

import { useCheckBusinessDomain } from 'features/CNC/hooks/useCheckBusinessDomain';
import { useGetHotjarRecordingEnabled } from 'features/CNC/hooks/useGetHotjarRecordingEnabled';

import { ATTRIBUTES_GROWTH_BOOK, COMMON_ATTRIBUTES } from 'constants/growthBookConstant';

import { IUserSignPayment } from 'interfaces/payment/payment.interface';
import { IUser } from 'interfaces/user/user.interface';

type Payload = Pick<ATTRIBUTES_GROWTH_BOOK, COMMON_ATTRIBUTES>;

const useGetCommonAttributes = (): Payload => {
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const { _id: userId, email, createdAt, loginService, payment } = currentUser || {};
  const { type: userPlan, status: userPlanStatus } = payment || {};
  const userCreatedAtEpochSeconds = Math.floor(Date.parse(createdAt?.toString()) / 1000);
  const { anonymousUserId } = cookieManager;
  const browserLanguage = getFullLanguageFromBrowser();
  const { type: userSignPlan, status: userSignPlanStatus } =
    useSelector<unknown, IUserSignPayment>(selectors.getUserSignPayment, shallowEqual) || {};
  const { isBusinessDomain } = useCheckBusinessDomain();
  const hjRecordingEnabled = useGetHotjarRecordingEnabled() && isBusinessDomain;

  return useMemo(
    (): Payload => ({
      id: userId,
      email,
      userCreatedAtEpochSeconds,
      loginService,
      userPlan,
      userPlanStatus,
      userSignPlan,
      userSignPlanStatus,
      anonymousUserId,
      browserLanguage,
      isBusinessDomain,
      hjRecordingEnabled,
    }),
    [
      userId,
      email,
      userCreatedAtEpochSeconds,
      loginService,
      userPlan,
      userPlanStatus,
      userSignPlan,
      userSignPlanStatus,
      anonymousUserId,
      browserLanguage,
      isBusinessDomain,
      hjRecordingEnabled,
    ]
  );
};

export default useGetCommonAttributes;
