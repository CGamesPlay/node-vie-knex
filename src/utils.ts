/**
 * Refers to a value that may be available synchronously or asynchronously.
 */
export type MaybePromise<T> = T | Promise<T>;

/** @hidden */
export const isPromise = <T>(promise: MaybePromise<T>): promise is Promise<T> =>
  !!(promise && typeof (promise as any).then === "function");

/**
 * Apply the function to the given result. If the result is a Promise, wait for
 * the result before applying the function. Otherwise, the function will be
 * applied synchronously.
 *
 * @hidden
 */
export function after<T, U>(
  maybePromise: MaybePromise<T>,
  func: (x: T) => U,
): MaybePromise<U> {
  if (isPromise(maybePromise)) {
    return maybePromise.then(func);
  } else {
    return func(maybePromise);
  }
}

/**
 * Given an unordered array of V, return an array matching the length of the
 * ids, but where each entity is the object in objs where
 * obj[key] === ids[i]. Useful for resorting a DataLoader result set.
 *
 * @hidden
 **/
export function mapByKeys<V>(
  ids: Array<string>,
  key: keyof V,
  objs: Array<V>,
): Array<V | null> {
  const index: { [key: string]: V } = {};
  objs.forEach(o => (index[o[key] as any] = o));
  return ids.map(id => index[id]);
}
