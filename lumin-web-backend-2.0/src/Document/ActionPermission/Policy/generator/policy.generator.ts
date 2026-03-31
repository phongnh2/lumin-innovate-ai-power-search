import { BSON } from 'bson';
import * as chalk from 'chalk';
import { writeFileSync } from 'fs';
import { join } from 'path';

import runner from '../../test/policy-runner';
import * as policies from '../policies.json';

process.stdout.write(chalk.green.bold('[Document Action Policy] Policy generator\n'));

const isSuccessValidation = runner.validatePolicyJson() && runner.validateSidOfPolicy();
if (!isSuccessValidation) {
  process.stdout.write(chalk.red.bold('Cannot generate new policy snapshot. Expect all test passed\n'));
  process.exit(1);
}

const bson = new BSON();

process.stdout.write(chalk.green.bold('Generate policies of organization\n'));

const policiesBSONPath = join(process.cwd(), 'src/Document/ActionPermission/Policy/snapshot/policies.bson');

const newPoliciesBSON = bson.serialize(policies);
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
writeFileSync(policiesBSONPath, newPoliciesBSON);

process.stdout.write(chalk.green.bold('[Document Action Policy] Policy generator DONE!!!\n'));

process.exit(0);
