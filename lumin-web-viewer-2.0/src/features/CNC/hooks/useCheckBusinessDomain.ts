import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import validators from 'utils/validator';

import { IUser } from 'interfaces/user/user.interface';

const useCheckBusinessDomain = () => {
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const { email, isPopularDomain } = currentUser || {};
  const isEducationDomain = email && validators.validateDomainEducation(email);
  const isBusinessDomain = Boolean(email) && !isPopularDomain && !isEducationDomain;

  return { isBusinessDomain };
};

export { useCheckBusinessDomain };
