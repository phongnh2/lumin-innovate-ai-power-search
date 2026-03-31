import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';

import organizationServices from 'services/organizationServices';

import validator from 'utils/validator';

import { IOrganization, OrganizationPupose } from 'interfaces/organization/organization.interface';

type Payload = {
  createOrganization: () => Promise<IOrganization>;
};

type Props = {
  newOrganization: {
    name: string;
    error: string;
  };
};

const useCreateOrganizationInPayment = ({ newOrganization }: Props): Payload => {
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual) ;

  const createOrganization = async (): Promise<IOrganization> => {
    const isEducation = await validator.validateDomainEducation(currentUser.email);

    const { organization }: { organization: IOrganization } = await organizationServices.createOrganization({
      organizationData: {
        name: newOrganization.name,
        purpose: isEducation ? OrganizationPupose.EDUCATION : OrganizationPupose.WORK,
      },
    });
    return organization;
  };

  return {
    createOrganization,
  };
};

export default useCreateOrganizationInPayment;
