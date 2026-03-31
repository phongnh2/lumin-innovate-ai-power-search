/* eslint-disable max-classes-per-file */
import { plainToClass } from 'class-transformer';
import {
  IsInt, IsNotEmpty, Length, Max, Min, validateSync,
} from 'class-validator';
import * as crypto from 'crypto';
import { inRange, isInteger, orderBy } from 'lodash';

const MIN_POPULATION = 0;
const MAX_POPULATION = 100;

export class TestVariant<TName> {
  @IsNotEmpty()
  @Length(2, 20)
    name: TName;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
    percentage: number;

  rules?: unknown[];
}

type TestResult<TName> = {
  variant: TestVariant<TName>;
  bucket: number;
  isPopulated: boolean;
}

export interface IExperimentTest<TName = any> {
  evaluate(identifierId: string): void;
  withPopulation: (population: number) => this;
  withVariant: (variant: TestVariant<TName>) => this;
}

type TConstructorOptions = {
  expName: string;
  disabled?: boolean;
  reorder?: boolean;
}

export class ExperimentTest<TName extends string> implements IExperimentTest {
  private readonly _bucketSize: number = 10000;

  private _population: number = 100;

  private _variants: Map<string, TestVariant<TName>> = new Map<string, TestVariant<TName>>();

  private _experimentName: string;

  private _disabled: boolean = false;

  private _reorder: boolean = false;

  /**
    * @param {TConstructorOptions} payload
    * @param {string} payload.expName - The experiment name
    * @param {string} payload.disabled - Whether the experiment is disabled
    * @param {string} payload.reorder - Variants will be reordered in the list by variant name
   */
  constructor({ expName, disabled, reorder }: TConstructorOptions) {
    this._experimentName = expName;
    this._disabled = disabled || false;
    this._reorder = reorder || false;
  }

  /**
   * @param population Percentage of users to be included in the experiment
   * @returns ExperimentTest
   */
  withPopulation(population: number): this {
    if (!(isInteger(population) && inRange(MIN_POPULATION, MAX_POPULATION + 1))) {
      throw new Error('Population must be an integer between 0 and 100');
    }
    this._population = population;
    return this;
  }

  /**
   * @param variant Variant to be included in the experiment
   * @returns ExperimentTest
   */
  withVariant(variant: TestVariant<TName>): this {
    const obj = plainToClass<TestVariant<TName>, TestVariant<TName>>(TestVariant, variant);
    const errors = validateSync(obj);
    if (errors.length) {
      throw new Error(errors.toString());
    }
    if (this._variants.has(<string>variant.name)) {
      throw new Error(`Variant "${variant.name}" has already existed`);
    }
    if (!this.isValidPercentage(variant)) {
      throw new Error('Total percentage of variants must be less than or equal to 100');
    }

    this._variants.set(<string>variant.name, variant);
    if (this._reorder && this._variants.size > 1) {
      const reorderMap = new Map<string, TestVariant<TName>>();
      const keys = [...this._variants.keys()];
      orderBy(keys).forEach((key) => {
        reorderMap.set(key, this._variants.get(key));
      });
      this._variants = reorderMap;
    }
    return this;
  }

  private isValidPercentage(incomingVariant: TestVariant<TName>): boolean {
    const currentPercentage = [...this._variants.values()].reduce((acc, variant) => acc + variant.percentage, 0);
    return currentPercentage + incomingVariant.percentage <= 100;
  }

  private hashIdentifier(id: string): string {
    const identifier = `${id}${this._experimentName}`;
    const hash = crypto
      .createHash('md5')
      .update(identifier)
      .digest('hex');
    return hash;
  }

  private getBucket(hash: string): number {
    const truncatedHash = hash.slice(0, 16);
    const longNumber = parseInt(truncatedHash, 16);
    return longNumber % this._bucketSize;
  }

  private determineVariant(bucket: number): TestResult<TName> | null {
    let startBucket = 0;
    const variants = [...this._variants.values()];
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const endPopulationBucket = Math.floor((this._bucketSize * v.percentage / 100) * this._population / 100) + startBucket - 1;
      const endBucket = Math.floor((this._bucketSize * v.percentage / 100)) + startBucket - 1;
      if (inRange(bucket, startBucket, endPopulationBucket + 1)) {
        return {
          variant: v,
          bucket,
          isPopulated: true,
        };
      }
      startBucket = endBucket + 1;
    }
    return {
      isPopulated: false,
      bucket: null,
      variant: null,
    };
  }

  /**
   * @param identifier The string representing the user identifier
   * @returns TestResult | null
   */
  evaluate(identifier: string): TestResult<TName> | null {
    if (this._disabled) {
      return null;
    }
    const hash = this.hashIdentifier(identifier);
    const bucket = this.getBucket(hash);
    return this.determineVariant(bucket);
  }
}
