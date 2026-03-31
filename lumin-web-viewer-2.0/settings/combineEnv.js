/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const namespaces = {
  develop: ['develop', 'viewer', 'pnb', 'onedrive-dev', 'workspace', 'local'],
  staging: ['staging', 'viewer-staging', 'mobile-staging', 'cnc', 'viewer-testing'],
  production: ['production', 'preprod'],
};

const findNamespace = (branchName) => {
  const namespaceResult = Object.entries(namespaces).find(([_namespace, _branches]) => _branches.includes(branchName));
  if (!namespaceResult || namespaceResult.length !== 2) {
    throw new Error(`No namespace found for branch ${branchName}`);
  }
  return namespaceResult[0];
};

const getNamespaceEnv = (branchName) => {
  const namespace = findNamespace(branchName);
  const sharedEnv = require(`./${namespace}/_common.json`);
  if (!sharedEnv) {
    throw new Error(`No shared env found for namespace ${namespace} at branch ${branchName}`);
  }
  // `local` is a common LUMIN_BRANCH for machine-only overrides; use develop API/env files
  const branchFile = branchName === 'local' ? 'develop' : branchName;
  const branchEnv = require(`./${namespace}/${branchFile}.json`);
  if (!branchEnv) {
    throw new Error(`No branch env found for namespace ${namespace} at branch ${branchName}`);
  }
  return {
    ...sharedEnv,
    ...branchEnv,
  };
};

module.exports = {
  getNamespaceEnv,
};
