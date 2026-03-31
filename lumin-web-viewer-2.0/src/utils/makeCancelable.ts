/**
 *
 * @link https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
 */

/* eslint-disable prefer-promise-reject-errors */
type Payload<T> = {
  promise: (...args: unknown[]) => Promise<T>;
  cancel: () => void;
};

export const makeCancelable = <T>(promise: (...args: unknown[]) => Promise<T>): Payload<T> => {
  let _hasCanceled = false;

  const wrappedPromise = (...args: unknown[]) =>
    new Promise<T>((resolve, reject) => {
      promise(...args).then(
        (val) => (_hasCanceled ? reject({ isCanceled: true }) : resolve(val)),
        (error) => (_hasCanceled ? reject({ isCanceled: true }) : reject(error))
      );
    });

  const cancel = () => {
    _hasCanceled = true;
  };

  return {
    promise: wrappedPromise,
    cancel,
  };
};
