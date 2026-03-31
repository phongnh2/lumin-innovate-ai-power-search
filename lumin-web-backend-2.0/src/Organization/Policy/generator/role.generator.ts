/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as chalk from 'chalk';
import { writeFileSync, readFileSync } from 'fs';
import { cloneDeep } from 'lodash';
import { join } from 'path';

// eslint-disable-next-line import/extensions
import runner from '../../test/policy-runner';
import * as roles from '../roles.json';

const BSON = require('bson');

const isSuccessValidation = runner.validateRolesJson() && runner.validateSidOfRoles();
if (!isSuccessValidation) {
  process.stdout.write(chalk.red.bold('Cannot generate new role snapshot. Expect all test passed\n'));
  process.exit(1);
}

const bson = new BSON();

process.stdout.write(chalk.green.bold('Generate roles of organization\n'));

const roleBSONPath = join(process.cwd(), 'src/Organization/Policy/snapshot/roles.bson');
const roleJSONPath = join(process.cwd(), 'src/Organization/Policy/roles.json');
const rolesBSON = readFileSync(roleBSONPath);

const snapshotRoles = bson.deserialize(rolesBSON);

const rawRoles = cloneDeep(roles);

// Ensure permission of every roles is immutable before generate new rolw

Object.entries(roles).forEach(([resource, value]) => {
  const [_, snapData] = Object.entries(snapshotRoles).find(([snapResource]) => snapResource === resource) as [unknown, Record<string, any>];
  Object.entries(value).forEach(([role, roleValue]) => {
    const snapValue = snapData[role];
    const orgValues = Object.values(roleValue.permissions);
    const snapOrgValues = Object.values(snapValue.permissions);

    const orgNotChanged = orgValues.length === snapOrgValues.length && orgValues.every(
      (orgValue) => snapOrgValues.find((snapOrgValue) => snapOrgValue === orgValue),
    );
    const versionNotChanged = roleValue.version === snapValue.version;
    if (orgNotChanged && !versionNotChanged) {
      rawRoles[resource][role].version = snapValue.version;
    }
    const newVersion = Math.round(new Date().getTime() / 1000);
    if (!orgNotChanged
    && (versionNotChanged
      || (!versionNotChanged && rawRoles[resource][role].version < newVersion))) {
      rawRoles[resource][role].version = newVersion;
    }
  });
});

const newRolesBSON = bson.serialize(rawRoles);
writeFileSync(roleJSONPath, Buffer.from(JSON.stringify(rawRoles, null, ' ')));
writeFileSync(roleBSONPath, newRolesBSON);

process.stdout.write(chalk.green.bold('DONE!!!\n'));

process.exit(0);
