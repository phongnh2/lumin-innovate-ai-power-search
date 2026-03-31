/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as chalk from 'chalk';
import { isEqual, isNumber, isBoolean } from 'lodash';
// import { execSync } from 'child_process';
// // eslint-disable-next-line import/extensions
// import { UUID_NAMESPACE } from '../../constant';

// const root = execSync('npm root -g')
//   .toString()
//   .trim();
// // eslint-disable-next-line import/no-dynamic-require
// const { validate, v5 } = require(`${root}/uuid`);

enum ValidateType {
  ERROR = 'error',
  SUCCESS = 'success',
}

type ValidateAccumData = {
  type: ValidateType,
  title: string,
  error: string,
}

type TestSummary = {
  passed: number,
  failed: number,
}

export class Validator<T> {
  private validateValue: T;

  private validateResult: boolean;

  private validateError: string;

  private errorMessage: string;

  private validateTitle: string;

  private validateErrorAccum: ValidateAccumData[] = [];

  static testSummary: TestSummary = { passed: 0, failed: 0 };

  static write(message: string): void {
    process.stdout.write(`\n${chalk.yellow.bold(message)}\n\n`);
  }

  title(value: string): Validator<T> {
    this.validateTitle = value;
    return this;
  }

  error(value: string): Validator<T> {
    this.errorMessage = `${chalk.red(value)}`;
    return this;
  }

  isFailed(): boolean {
    return Validator.testSummary.failed !== 0;
  }

  expect(value: T): Validator<T> {
    this.validateValue = value;
    return this;
  }

  oneOf(data: T[]): Validator<T> {
    this.validateResult = Boolean(data.includes(this.validateValue));
    this.validateError = `Expected ${chalk.red(this.validateValue.toString())} is one of the values ${chalk.green(data.toString())}`;
    return this;
  }

  childOf(data: T[]): Validator<T> {
    this.validateResult = Array.isArray(this.validateValue) && this.validateValue.every((value) => Boolean(data.includes(value)));
    this.validateError = `Expected ${chalk.red(this.validateValue.toString())} is child of the ${chalk.green(data.toString())}`;
    return this;
  }

  existKey<K extends keyof T>(key: K): Validator<T> {
    this.validateResult = Boolean(this.validateValue && this.validateValue[key]);
    this.validateError = `Expected ${chalk.red(key)} exist in ${chalk.green(JSON.stringify(this.validateValue))}`;
    return this;
  }

  isEqual(data: T): Validator<T> {
    this.validateResult = isEqual(this.validateValue, data);
    this.validateError = `Expected ${chalk.red(this.validateValue.toString())} is equal to ${chalk.green(data.toString())}`;
    return this;
  }

  existValue(data: T): Validator<T> {
    this.validateResult = Array.isArray(this.validateValue) && this.validateValue.includes(data);
    this.validateError = `Expected ${chalk.red(this.validateValue.toString())} is existing value ${chalk.green(data.toString())}`;
    return this;
  }

  notExistValue(data: T): Validator<T> {
    this.validateResult = Array.isArray(this.validateValue) && !this.validateValue.includes(data);
    this.validateError = `Expected ${chalk.red(this.validateValue.toString())} is not existing value ${chalk.green(data.toString())}`;
    return this;
  }

  isNumber(): Validator<T> {
    this.validateResult = isNumber(this.validateValue);
    this.validateError = `Expected ${chalk.red(this.validateValue.toString())} is number`;
    return this;
  }

  isBoolean(): Validator<T> {
    this.validateResult = isBoolean(this.validateValue);
    this.validateError = `Expected ${chalk.red(this.validateValue.toString())} is boolean`;
    return this;
  }

  // isUUID(): Validator<T> {
  //   this.validateResult = validate(this.validateValue);
  //   this.validateError = `Expected ${chalk.red(this.validateValue.toString())} is UUID`;
  //   return this;
  // }

  // isSidMatching(data: T): Validator<T> {
  //   this.validateResult = v5(this.validateValue, UUID_NAMESPACE) === data;
  //   this.validateError = `Expected ${chalk.red(data)} is created from ${this.validateValue.toString()}`;
  //   return this;
  // }

  build(): void {
    const accumData = {
      type: this.validateResult ? ValidateType.SUCCESS : ValidateType.ERROR,
      title: this.validateTitle,
      error: this.errorMessage || this.validateError,
    } as ValidateAccumData;

    if (accumData.type === ValidateType.SUCCESS) {
      process.stdout.write(`${chalk.rgb(0, 0, 0).bold.bgGreen('PASS')} ${chalk.green.bold(accumData.title)} ${chalk.green.bold('✔')}\n`);
      Validator.testSummary.passed++;
    } else {
      process.stdout.write(
        `${chalk.rgb(0, 0, 0).bold.bgRed('FAIL')} ${chalk.red.bold(accumData.title)} ${chalk.red.bold('✖')}\n\n${accumData.error}\n`,
      );
      this.validateErrorAccum.push(accumData);
      Validator.testSummary.failed++;
    }
  }

  summary(): void {
    process.stdout.write(chalk.yellow.bold('\nSummary!!!!!\n'));
    this.validateErrorAccum.forEach((e) => {
      process.stdout.write(
        `${chalk.rgb(0, 0, 0).bold.bgRed('FAIL')} ${chalk.red.bold(e.title)} ${chalk.red.bold('✖')}\n\n${e.error}\n`,
      );
    });
    let summary = `Tests: ${Validator.testSummary.failed === 0 ? '' : chalk.red(`${Validator.testSummary.failed} failed, `)}`;
    summary = summary.concat(`${Validator.testSummary.passed === 0 ? '' : chalk.green(`${Validator.testSummary.passed} passed, `)}`);
    summary = summary.concat(`${chalk.white(`${Validator.testSummary.failed + Validator.testSummary.passed} total`)}\n`);
    process.stdout.write(summary);
    if (Validator.testSummary.failed !== 0) process.exit(1);
    process.exit(0);
  }
}
