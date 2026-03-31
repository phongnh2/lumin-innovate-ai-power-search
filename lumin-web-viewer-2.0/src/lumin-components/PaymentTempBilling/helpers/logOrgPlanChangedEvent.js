import organizationEvent from 'utils/Factory/EventCollection/OrganizationEventCollection';

export default ({ orgId, previousPayment, newPayment, previousDocStackStorage, newDocStackStorage }) => {
  const { type: previousPlanName, quantity: previousNumberOfUsers, period: previousPlanPeriod } = previousPayment || {};
  const { type: newPlanName, quantity: newNumberOfUsers, period: newPlanPeriod } = newPayment || {};
  const { totalStack: previousDocStack } = previousDocStackStorage || {};
  const { totalStack: newDocStack } = newDocStackStorage || {};
  organizationEvent.planChanged({
    previousPlanName,
    previousNumberOfUsers,
    newNumberOfUsers,
    newPlanName,
    organizationId: orgId,
    previousPlanPeriod,
    newPlanPeriod,
    previousDocStack,
    newDocStack,
  });
};
