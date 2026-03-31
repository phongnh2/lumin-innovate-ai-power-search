import { BSON } from 'bson';
import * as chalk from 'chalk';
import { writeFileSync, readFileSync } from 'fs';
import { cloneDeep } from 'lodash';
import { join } from 'path';

import runner from '../../test/policy-runner';
import * as roles from '../roles.json';

process.stdout.write(chalk.green.bold('[Document Action Policy] Role generator\n'));

const isSuccessValidation = runner.validateRolesJson() && runner.validateSidOfRoles();
if (!isSuccessValidation) {
  process.stdout.write(chalk.red.bold('Cannot generate new role snapshot. Expect all test passed\n'));
  process.exit(1);
}

const bson = new BSON();

process.stdout.write(chalk.green.bold('Generate roles of document\n'));

const roleBSONPath = join(process.cwd(), 'src/Document/ActionPermission/Policy/snapshot/roles.bson');
const roleJSONPath = join(process.cwd(), 'src/Document/ActionPermission/Policy/roles.json');
const rolesBSON = readFileSync(roleBSONPath);

const snapshotRoles = bson.deserialize(rolesBSON);

const rawRoles = cloneDeep(roles);

// Ensure permission of every roles is immutable before generate new role
Object.entries(roles).forEach(([resource, value]) => {
  const [_, snapData] = Object.entries(snapshotRoles as Record<string, unknown>).find(([snapResource]) => snapResource === resource) as [
    unknown,
    Record<string, any>,
  ];
  Object.entries(value).forEach(([role, roleValue]) => {
    const snapValue = snapData[role];
    const orgValues = Object.values(roleValue.permissions);
    const snapDocValues = Object.values(snapValue.permissions as Record<string, unknown>);

    const docNotChanged = orgValues.length === snapDocValues.length && orgValues.every(
      (orgValue) => snapDocValues.includes(orgValue),
    );
    const versionNotChanged = roleValue.version === snapValue.version;
    if (docNotChanged && !versionNotChanged) {
      rawRoles[resource][role].version = snapValue.version;
    }
    const newVersion = Math.round(new Date().getTime() / 1000);
    if (!docNotChanged
    && (versionNotChanged
      || (!versionNotChanged && rawRoles[resource][role].version < newVersion))) {
      rawRoles[resource][role].version = newVersion;
    }
  });
});

const newRolesBSON = bson.serialize(rawRoles);
writeFileSync(roleJSONPath, Buffer.from(JSON.stringify(rawRoles, null, 2)));
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
writeFileSync(roleBSONPath, newRolesBSON);

process.stdout.write(chalk.green.bold('[Document Action Policy] Role generator DONE!!!\n'));

process.exit(0);
