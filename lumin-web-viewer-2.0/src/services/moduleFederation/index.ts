import moduleFederationService from './moduleFederationService';

// Export the service instance
export { moduleFederationService };

// Export the loadRemote function directly for easier migration
export const loadRemote = (moduleSpecifier: string) => moduleFederationService.loadRemote(moduleSpecifier);

export default moduleFederationService;
