import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { useLocalStorage } from 'react-use';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { LocalStorageKey } from 'constants/localStorageKey';

import { OrganizationList } from 'interfaces/redux/organization.redux.interface';
import { IUser } from 'interfaces/user/user.interface';

type SkipTrialType = Record<string, string[]>;

const useUpdateSkipTrialModalStorage = () => {
  const currentUser = useShallowSelector<IUser>(selectors.getCurrentUser);
  const { data: organizations, loading } = useShallowSelector<OrganizationList>(selectors.getOrganizationList);
  const [storage, setStorage] = useLocalStorage<SkipTrialType>(LocalStorageKey.SKIP_ORG_PROMOTION_TRIAL_MODAL, {});

  const updateStorage = () => {
    if (isEmpty(currentUser)) {
      return;
    }

    const skipTrial = storage[currentUser._id];
    if (!skipTrial) {
      return;
    }

    const newList = skipTrial.reduce<string[]>((acc, currentValue) => {
      const org = organizations.find(
        (_org) => _org.organization._id === currentValue || _org.organization.url === currentValue
      );

      if (isEmpty(org)) {
        return acc;
      }

      const { organization } = org;
      acc.push(organization.url);
      return acc;
    }, []);

    setStorage({ [currentUser._id]: newList });
  };

  useEffect(() => {
    if (loading || !organizations?.length) {
      return;
    }

    updateStorage();
  }, [loading]);
};

export default useUpdateSkipTrialModalStorage;
