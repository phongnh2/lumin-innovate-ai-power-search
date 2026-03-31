// eslint-disable-next-line import/extensions
import runner from './policy-runner';

// Ensure format of policy file system is correct
runner.validatePolicyJson();
// Ensure format of roles file system is correct
runner.validateRolesJson();
// Ensure sid value of policy not changed
runner.validateSidOfPolicy();
// Ensure sid value of roles not changed
runner.validateSidOfRoles();
// Ensure all policy in file system is exist in graphql
runner.validatePolicySystemWithPolicyGraph();
// Ensure policy to be used
runner.validatePolicyWithRolesFileSystem();
// Ensure policy file system is matching with policy snapshot
runner.comparePoliciesFileSystemWithSnapshot();
// Ensure roles file system is matching with roles snapshot
runner.compareRolesFileSystemWithSnapshot();
// Summary
runner.summary();
