import { isNil, isPresent } from "./guards";
import type { Option } from "./option";
import { None, Some, into as intoOption } from "./option";
import type { Maybe, PlainObject } from "./types";

type Iter<T> = Iterable<T> | ArrayLike<T>;

/**
 * Returns the index of an array with length `len` that corresponds to `index`, which may be negative to index from the end of the array.

 * @param {number} len - The length of the array.
 * @param {number} index - The input index, which may be negative.
 * @returns {number} The corresponding non-negative index.
 */
const getIndex = (len: number, index: number): number =>
  index < 0 ? len + index : index;

/**
 * Appends one or more values to an array.

 * @param {readonly T[]} arr - The input array.
 * @param {...T[]} values - The values to append.
 * @returns {T[]} A new array with the original values followed by the appended values.
 * @template T
 */
export const append = <T>(arr: readonly T[], ...values: T[]): T[] => [
  ...arr,
  ...values,
];

/**
 * Returns a new array with all `null` and `undefined` elements removed.

 * @param {readonly Maybe<T>[]} arr - The input array.
 * @returns {T[]} A new array with only the non-nullable elements.
 * @template T
 */
export const compact = <T>(arr: readonly Maybe<T>[]): T[] =>
  arr.filter(isPresent);

/**
 * Returns a new array with the first `n` elements removed.

 * @param {readonly T[]} arr - The input array.
 * @param {number} n - The number of elements to drop.
 * @returns {T[]} A new array with the first `n` elements removed.
 * @template T
 */
export const drop = <T>(arr: readonly T[], n: number): T[] => arr.slice(n);

/**
 * Returns an `Option` that contains the first element of an array, or `None` if the array is empty.

 * @param {readonly T[]} arr - The input array.
 * @returns {Option<T>} An `Option` that contains the first element of the array, or `None` if the array is empty.
 * @template T
 */
export const first = <T>(arr: readonly T[]): Option<T> => intoOption(arr[0]);

/**
 * Converts an iterable or array-like object to an array.
 *
 * @param {Iter<T> | null | undefined} [iter] - The iterable or array-like object to convert.
 * @returns {T[]} A new array with the elements of the iterable or array-like object.
 * @template T
 */
export const into = <T>(iter?: Iter<T> | null): T[] =>
  isNil(iter) ? [] : Array.from(iter);

/**
 * Returns an `Option` that contains the last element of an array, or `None` if the array is empty.
 *
 * @param {readonly T[]} arr - The input array.
 * @returns {Option<T>} An `Option` that contains the last element of the array, or `None` if the array is empty.
 * @template T
 */
export const last = <T>(arr: readonly T[]): Option<T> =>
  intoOption(arr[arr.length - 1]);

/**
 * Prepends one or more values to an array.

 * @param {readonly T[]} arr - The input array.
 * @param {...T[]} values - The values to prepend.
 * @returns {T[]} A new array with the prepended values followed by the original values.
 * @template T
 */
export const prepend = <T>(arr: readonly T[], ...values: T[]): T[] => [
  ...values,
  ...arr,
];

/**
 * Returns a new array with the elements in reverse order.
 *
 * @param {readonly T[]} arr - The input array.
 * @returns {T[]} A new array with the elements in reverse order.
 * @template T
 */
export const reverse = <T>(arr: readonly T[]): T[] => [...arr].reverse();

/**
 * Returns a new array with the first n elements.

 * @param {readonly T[]} arr - The input array.
 * @param {number} n - The number of elements to take.
 * @returns {T[]} A new array with the first n elements.
 * @template T
 */
export const take = <T>(arr: readonly T[], n: number): T[] => arr.slice(0, n);

/**
 * Returns a new array with duplicate elements removed.
 *
 * @param {readonly T[]} arr - The input array.
 * @returns {T[]} A new array with only the unique elements in the input array.
 * @template T
 */
export const uniq = <T>(arr: readonly T[]): T[] => [...new Set(arr)];

/**
 * Returns an Option that contains the element of an array at a given index, or None if the index is out of bounds.
 *
 * @param {readonly T[]} arr - The input array.
 * @param {number} index - The index of the element to return.
 * @returns {Option<T>} An Option that contains the element of the array at the given index, or None if the index is out of bounds.
 * @template T
 */
export const at = <T>(arr: readonly T[], index: number): Option<T> =>
  intoOption(arr[getIndex(arr.length, index)]);

/**
 * Returns a new array that is sorted using the provided comparison function.

 * @param {readonly T[]} arr - The input array.
 * @param {(left: T, right: T) => number} [f] - The comparison function used to sort the array.
 * @returns {T[]} A new array that is sorted using the provided comparison function.
 * @template T
 */
export const sort = <T>(
  arr: readonly T[],
  f?: (left: T, right: T) => number,
): T[] => [...arr].sort(f);

/**
 * Returns an `Option` that contains the first element in the array that satisfies the provided testing function, or `None` if no elements pass the test.
 *
 * @param {readonly T[]} arr - The input array.
 * @param {(value: T, index: number) => boolean} f - The testing function.
 * @returns {Option<T>} An `Option` that contains the first element in the array that satisfies the provided testing function, or `None` if no elements pass the test.
 * @template T
 */
export const find = <T>(
  arr: readonly T[],
  f: (value: T, index: number) => boolean,
): Option<T> => intoOption(arr.find(f));

/**
 * Returns an object that groups the elements of an array by a key returned by a given function.
 *
 * @param {readonly T[]} arr - The input array.
 * @param {(value: T, index: number) => K} f - The function that returns the key used to group elements.
 * @returns {Record<K, T[]>} An object that groups the elements of the array by the key returned by the provided function.
 * @template T
 * @template K
 */
export const group = <T, K extends PropertyKey>(
  arr: readonly T[],
  f: (value: T, index: number) => K,
): Record<K, T[]> => {
  const obj = Object.create(null);
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    const key = f(item, i);
    if (!(key in obj)) {
      obj[key] = [];
    }
    obj[key].push(item);
  }
  return obj;
};

/**
 * Groups the elements of an array by a given property key and returns an object with the resulting groups.
 *
 * @param {readonly T[]} arr - The input array.
 * @param {K} key - The property key to group by.
 * @returns {Record<T[K] extends PropertyKey ? T[K] : never, T[]>} An object where each key is the value of the given property for some element in the array, and each value is an array of elements that have that value for the property.
 * @template T
 * @template K
 */
export const groupBy = <T extends PlainObject, K extends keyof T>(
  arr: readonly T[],
  key: K,
): Record<T[K] extends PropertyKey ? T[K] : never, T[]> =>
  group(arr, (item) => item[key] as PropertyKey);

/**
 * Inserts a value into an array at a specific index.
 *
 * @template T - The type of the elements in the array.
 * @param {readonly T[]} arr - The array to insert into.
 * @param {T} value - The value to insert into the array.
 * @param {number} at - The index to insert the value at. If negative, starts from the end of the array.
 * @returns {T[]} A new array with the value inserted at the specified index.
 */
export const insert = <T>(arr: readonly T[], value: T, at: number): T[] => {
  at = getIndex(arr.length, at);
  const copy = [...arr];
  copy.splice(at, 0, value);
  return copy;
};

/**
 * Moves an element in an array from one index to another.
 *
 * @template T - The type of the elements in the array.
 * @param {readonly T[]} arr - The array to move the element in.
 * @param {number} from - The index of the element to move. If negative, starts from the end of the array.
 * @param {number} to - The index to move the element to. If negative, starts from the end of the array.
 * @returns {T[]} A new array with the element moved to the specified index.
 */
export const move = <T>(arr: readonly T[], from: number, to: number): T[] => {
  from = getIndex(arr.length, from);
  to = getIndex(arr.length, to);
  const copy = [...arr];
  const item = copy.splice(from, 1)[0];
  copy.splice(to, 0, item);
  return copy;
};

/**
 * Removes an element from an array at a specific index.
 *
 * @template T - The type of the elements in the array.
 * @param {readonly T[]} arr - The array to remove the element from.
 * @param {number} at - The index of the element to remove. If negative, starts from the end of the array.
 * @returns {T[]} A new array with the element removed at the specified index.
 */
export const remove = <T>(arr: readonly T[], at: number): T[] => {
  at = getIndex(arr.length, at);
  const copy = [...arr];
  copy.splice(at, 1);
  return copy;
};

/**
 * Shuffles the elements in an array.
 *
 * @template T - The type of the elements in the array.
 * @param {readonly T[]} arr - The array to shuffle.
 * @returns {T[]} A new array with the elements shuffled.
 */
export const shuffle = <T>(arr: readonly T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
};

/**
 * Returns a new array with the elements at two specified positions swapped.
 *
 * @typeparam T - The type of the elements in the array.
 * @param arr - The array to be modified.
 * @param a - The index of the first element to be swapped.
 * @param b - The index of the second element to be swapped.
 * @returns A new array with the elements at two specified positions swapped.
 */
export const swap = <T>(arr: readonly T[], a: number, b: number): T[] => {
  a = getIndex(arr.length, a);
  b = getIndex(arr.length, b);
  const copy = [...arr];
  const temp = copy[a];
  copy[a] = copy[b];
  copy[b] = temp;
  return copy;
};

/**
 * Splits an array into chunks of a specified size.
 *
 * @typeparam T - The type of the elements in the array.
 * @param arr - The array to be chunked.
 * @param size - The size of each chunk.
 * @returns An array of arrays with the specified size of each chunk.
 */
export const chunk = <T>(arr: readonly T[], size: number): T[][] => {
  if (size <= 0) return [];

  const chunks: T[][] = [];
  let chunkIndex = 0;

  for (let i = 0; i < arr.length; i += size) {
    const chunk = arr.slice(i, i + size);
    chunks[chunkIndex++] = chunk;
  }

  return chunks;
};

/**
 * Returns an array with the elements from the first array that are not in the second array.
 *
 * @typeparam T - The type of the elements in the array.
 * @param arr1 - The array to be compared.
 * @param arr2 - The array to compare to.
 * @returns An array with the elements from the first array that are not in the second array.
 */
export const difference = <T>(arr1: readonly T[], arr2: readonly T[]): T[] => {
  const set = new Set(arr2);
  return arr1.filter((element) => !set.has(element));
};

/**
 * Returns a new array that contains every unique element from all input arrays.
 *
 * @typeparam T - The type of the elements in the array.
 * @param arrs - The arrays to be merged.
 * @returns A new array that contains every unique element from all input arrays.
 */
export const union = <T>(...arrs: T[][]): T[] => {
  const counts = new Map<T, number>();
  const res: T[] = [];

  for (let i = 0; i < arrs.length; i++) {
    const arr = arrs[i];
    for (let j = 0; j < arr.length; j++) {
      const el = arr[j];
      counts.set(el, (counts.get(el) || 0) + 1);
    }
  }

  counts.forEach((_, item) => res.push(item));

  return res;
};

/**
 * Returns a new array of arrays, where each array contains the elements at the same index from the input arrays.
 *
 * @template T
 * @param {...T[][]} arrs - Arrays to be zipped together.
 * @returns {T[][]} A new array of arrays.
 */
export const zip = <T>(...arrs: T[][]): T[][] => {
  const len = Math.min(...arrs.map((arr) => arr.length));
  const res: T[][] = [];

  for (let i = 0; i < len; i++) {
    const row: T[] = [];
    for (let j = 0; j < arrs.length; j++) {
      row.push(arrs[j][i]);
    }
    res.push(row);
  }

  return res;
};

/**
 * Returns a new array containing the elements of the input array until the predicate function returns `false`.
 *
 * @template T
 * @param {readonly T[]} arr - The input array.
 * @param {(value: T, index: number) => boolean} f - The predicate function to test each element.
 * @returns {T[]} A new array containing the elements of the input array until the predicate function returns `false`.
 */
export const takeWhile = <T>(
  arr: readonly T[],
  f: (value: T, index: number) => boolean,
): T[] => {
  const res: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (!f(value, i)) return res;
    res.push(value);
  }
  return res;
};

/**
 * Returns a new array containing the elements of the input array after the predicate function returns `false`.
 *
 * @template T
 * @param {readonly T[]} arr - The input array.
 * @param {(value: T, index: number) => boolean} f - The predicate function to test each element.
 * @returns {T[]} A new array containing the elements of the input array after the predicate function returns `false`.
 */
export const dropWhile = <T>(
  arr: readonly T[],
  f: (value: T, index: number) => boolean,
): T[] => {
  let startIndex = 0;
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (f(value, i)) {
      startIndex++;
    } else {
      break;
    }
  }
  return arr.slice(startIndex);
};

/**
 * Returns a new array containing all elements from the input array except those passed as values.
 *
 * @template T
 * @param {readonly T[]} array - The input array.
 * @param {...T} values - The values to be excluded from the new array.
 * @returns {T[]} A new array containing all elements from the input array except those passed as values.
 */
export const without = <T>(array: readonly T[], ...values: T[]): T[] =>
  array.filter((value) => !values.includes(value));

/**
 * Returns an option containing the index of the first element in the input array for which the predicate function returns `true`, or `None` if no element satisfies the predicate.
 *
 * @template T
 * @param {readonly T[]} arr - The input array.
 * @param {(value: T, index: number) => boolean} f - The predicate function to test each element.
 * @returns {Option<number>} An option containing the index of the first element in the input array for which the predicate function returns `true`, or `None` if no element satisfies the predicate.
 */
export const findIndex = <T>(
  arr: readonly T[],
  f: (value: T, index: number) => boolean,
): Option<number> => {
  for (let i = 0; i < arr.length; i++) {
    if (f(arr[i], i)) return Some(i);
  }
  return None;
};
