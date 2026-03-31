import { Plans } from 'constants/plan';

export class UserUtilities {
  constructor({ user }) {
    this.user = user;
    this.payment = this.user.payment || {};
  }

  isFree() {
    return this.payment.type === Plans.FREE;
  }

  isPremium() {
    return this.payment.type !== Plans.FREE;
  }
}
