import { isNil, isObject, merge, omitBy, pickBy, set } from 'lodash';

export enum SizeResolution {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Desktop = 'desktop'
}

export type IResponsiveSize<TSize> = {
  [SizeResolution.Mobile]?: TSize;
  [SizeResolution.Tablet]?: TSize;
  [SizeResolution.Desktop]?: TSize;
};

export type SizeResolutionType = `${SizeResolution}`;

export abstract class SizeTransformer<TSize> {
  protected formatedSize!: IResponsiveSize<TSize>;

  constructor(private readonly size: unknown | IResponsiveSize<TSize>) {
    if (isObject(this.size)) {
      this.formatedSize = this.formatSize();
    }
  }

  protected formatSize(): IResponsiveSize<TSize> {
    const resolutions: SizeResolutionType[] = Object.values(SizeResolution);
    const castSize: IResponsiveSize<TSize> = { ...(this.size as IResponsiveSize<TSize>) };

    const resolutionMap: IResponsiveSize<TSize> = resolutions.reduce(
      (acc, resolution) => ({
        ...acc,
        [resolution]: null
      }),
      {}
    );
    Object.keys(castSize).forEach((resolution: string): void => {
      resolutionMap[resolution as SizeResolution] = castSize[resolution as SizeResolution];
    });

    let currentSize: TSize;
    let maxSize: TSize | undefined;

    resolutions.reverse().forEach(r => {
      currentSize = resolutionMap[r] || currentSize;
      maxSize = maxSize || resolutionMap[r];
      resolutionMap[r] = currentSize;
    });

    const missingResolutions: IResponsiveSize<TSize> = pickBy(resolutionMap, isNil);

    return merge({}, omitBy(resolutionMap, isNil), set(missingResolutions, Object.keys(missingResolutions), maxSize));
  }

  abstract transformer<TResult>(data: unknown): TResult;

  get<TTransformerResult>(resolution: SizeResolution): TTransformerResult {
    if (isObject(this.size)) {
      return this.transformer({ size: this.formatedSize[resolution] });
    }
    return this.transformer({ size: this.size });
  }
}
