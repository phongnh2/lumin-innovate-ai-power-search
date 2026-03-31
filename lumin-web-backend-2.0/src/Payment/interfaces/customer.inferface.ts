import { CustomerCreation } from 'graphql.schema';

export interface ICreateCustomer {
  customer: CustomerCreation;
  targetId: string;
  customerInfo: {
    _id: string;
    name: string;
    email: string,
    blockedPrepaidCardOnTrial?: string,
    openGoogleReferrer?: Array<string>
    // number value (0/1) represents to the boolean value
    isBusinessDomain?: number,
    totalMembers?: number,
    geoLocation?: {
      countryCode: string;
      city: string;
      region: string;
    };
  };
  stripeAccountId: string;
}
