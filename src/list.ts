import { isNegative, isPresent } from "./guards";
import type { Option } from "./option";
import { None, Some } from "./option";

/**
 * Returns the index of an array with length `len` that corresponds to `index`, which may be negative to index from the end of the array.
 * @param {number} len - The length of the array.
 * @param {number} index - The input index, which may be negative.
 * @returns {number} The corresponding non-negative index.
 */
const getIndex = (len: number, index: number): number =>
  index < 0 ? len + index : index;

/**
 * An iterable that represents either an iterable sequence or an array-like object.
 * @template T The type of the items in the iterable.
 */
type Iter<T> = Iterable<T> | ArrayLike<T>;

/**
 * A list implementation that provides an immutable API for working with arrays.
 * @template T The type of the items in the list.
 */
export class List<T> implements Iterable<T> {
  #arr: T[];

  /**
   * Creates a new list from an array.
   * @param {T[]} arr The array to create the list from.
   */
  private constructor(arr: T[]) {
    this.#arr = arr;
  }

  *[Symbol.iterator]() {
    yield* this.#arr[Symbol.iterator]();
  }

  /**
   * Returns an empty list.
   * @template T The type of the items in the list.
   * @returns {List<T>} An empty list.
   */
  static empty<T>(): List<T> {
    return new List<T>([]);
  }

  /**
   * Creates a new list from an iterable or array-like object.
   * @template T The type of the items in the list.
   * @param {Iter<T>} iter The iterable or array-like object to create the list from.
   * @returns {List<T>} A new list containing the items from the iterable or array-like object.
   */
  static from<T>(iter: Iter<T>): List<T> {
    return new List(Array.from(iter));
  }

  static range(from: number, to: number, step = 1): List<number> {
    const result: number[] = [];
    for (let i = from; i < to; i += step) {
      result.push(i);
    }
    return new List(result);
  }

  get length(): number {
    return this.#arr.length;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Appends one or more values to the end of the list and returns a new list.
   * @param {...T} values The values to append.
   * @returns {List<T>} A new list with the appended values.
   */
  append(...values: T[]): List<T> {
    return new List([...this.#arr, ...values]);
  }

  /**
   * Prepends one or more values to the beginning of the list and returns a new list.
   * @param {...T} values The values to prepend.
   * @returns {List<T>} A new list with the prepended values.
   */
  prepend(...values: T[]): List<T> {
    return new List([...values, ...this.#arr]);
  }

  /**
   * Returns a new list with the result of applying a function to each item in the list.
   * @template U The type of the items in the resulting list.
   * @param {(value: T, index: number) => U} f The function to apply to each item in the list.
   * @returns {List<U>} A new list with the result of applying the function to each item in the original list.
   */
  map<U>(f: (value: T, index: number) => U): List<U> {
    return new List(this.#arr.map(f));
  }

  filter<U extends T>(f: (value: T, index: number) => value is U): List<U> {
    return new List(this.#arr.filter(f));
  }

  /**
   * Applies a function to each item in the list.
   * @param {(value: T, index: number) => void} f The function to apply to each item in the list.
   * @returns {this} The current list instance.
   */
  each(f: (value: T, index: number) => void): this {
    this.#arr.forEach(f);
    return this;
  }

  /**
   * Reduces the list to a single value by applying a function to each item and accumulating the result.
   * @template U The type of the accumulated value.
   * @param {U} initialValue The initial value of the accumulator.
   * @param {(prev: U, next: T, index: number) => U} f The function to apply to each item in the list.
   * @returns {U} The final value of the accumulator after applying the function to each item in the list.
   */
  reduce<U>(initialValue: U, f: (prev: U, next: T, index: number) => U): U {
    return this.#arr.reduce(f, initialValue);
  }

  /**
   * Returns a new list with no null or undefined values.
   * @returns {List<NonNullable<T>>} A new list with no null or undefined values.
   */
  compact(): List<NonNullable<T>> {
    return new List(this.#arr.filter(isPresent) as NonNullable<T>[]);
  }

  /**
   * Returns a new list without the first n elements.
   * @param {number} n The number of elements to drop.
   * @returns {List<T>} A new list without the first n elements.
   */
  drop(n: number): List<T> {
    if (isNegative(n)) return List.empty<T>();
    return new List(this.#arr.slice(n));
  }

  /**
   * Returns a new list without elements from the beginning until the first element that doesn't satisfy the given condition.
   * @param {(value: T, index: number) => boolean} f The condition to satisfy.
   * @returns {List<T>} A new list without elements from the beginning until the first element that doesn't satisfy the given condition.
   */
  dropWhile(f: (value: T, index: number) => boolean): List<T> {
    const arr = this.#arr;
    let startIndex = 0;
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      if (f(value, i)) {
        startIndex++;
      } else {
        break;
      }
    }
    return this.drop(startIndex);
  }

  /**
   * Returns an option containing the first element of the list, or None if the list is empty.
   * @returns {Option<T>} An option containing the first element of the list, or None if the list is empty.
   */
  first(): Option<T> {
    return this.at(0);
  }

  /**
   * Returns an option containing the last element of the list, or None if the list is empty.
   * @returns {Option<T>} An option containing the last element of the list, or None if the list is empty.
   */
  last(): Option<T> {
    return this.at(this.length - 1);
  }

  /**
   * Returns a new list with the elements in reverse order.
   * @returns {List<T>} A new list with the elements in reverse order.
   */
  reverse(): List<T> {
    return new List([...this.#arr.reverse()]);
  }

  /**
   * Returns a new list with the first n elements of the list.
   * @param {number} n The number of elements to take.
   * @returns {List<T>} A new list with the first n elements of the list.
   */
  take(n: number): List<T> {
    if (isNegative(n)) return List.empty<T>();
    return new List(this.#arr.slice(0, n));
  }

  /**
   * Returns a new list with elements from the beginning until the first element that doesn't satisfy the given condition.
   * @param {(value: T, index: number) => boolean} f The condition to satisfy.
   * @returns {List<T>} A new list with elements from the beginning until the first element that doesn't satisfy the given condition.
   */
  takeWhile(f: (value: T, index: number) => boolean): List<T> {
    const arr = this.#arr;
    const res: T[] = [];
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      if (!f(value, i)) break;
      res.push(value);
    }
    return new List(res);
  }

  uniq(): List<T> {
    return List.from(new Set(this.#arr));
  }

  at(index: number): Option<T> {
    const arr = this.#arr;
    index = getIndex(arr.length, index);
    if (index < 0 || index >= arr.length) {
      return None;
    }
    return Some(arr[index]);
  }

  sort(f?: (a: T, b: T) => number): List<T> {
    return new List([...this.#arr].sort(f));
  }

  find(f: (value: T, index: number) => boolean): Option<T> {
    const found = this.#arr.find(f);
    return found ? Some(found) : None;
  }

  findIndex(f: (value: T, index: number) => boolean): Option<number> {
    const index = this.#arr.findIndex(f);
    return isNegative(index) ? None : Some(index);
  }

  group<K extends PropertyKey>(
    f: (value: T, index: number) => K,
  ): Record<K, T[]> {
    const arr = this.#arr;
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
  }

  groupBy<K extends keyof T>(
    key: K,
  ): Record<T[K] extends PropertyKey ? T[K] : never, T[] | undefined> {
    return this.group((item) => item[key] as PropertyKey);
  }

  insert(value: T, at: number): List<T> {
    at = getIndex(this.#arr.length, at);
    const copy = [...this.#arr];
    copy.splice(at, 0, value);
    return new List(copy);
  }

  move(from: number, to: number): List<T> {
    const arr = this.#arr;
    from = getIndex(arr.length, from);
    to = getIndex(arr.length, to);
    const copy = [...arr];
    const item = copy.splice(from, 1)[0];
    copy.splice(to, 0, item);
    return new List(copy);
  }

  remove(at: number): List<T> {
    const arr = this.#arr;
    at = getIndex(arr.length, at);
    const copy = [...arr];
    copy.splice(at, 1);
    return new List(copy);
  }

  shuffle(): List<T> {
    const copy = [...this.#arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return new List(copy);
  }

  swap(a: number, b: number): List<T> {
    const arr = this.#arr;
    a = getIndex(arr.length, a);
    b = getIndex(arr.length, b);
    const copy = [...arr];
    const temp = copy[a];
    copy[a] = copy[b];
    copy[b] = temp;
    return new List(copy);
  }

  toArray(): T[] {
    return Array.from(this);
  }

  toJSON() {
    return this.toArray();
  }

  toString() {
    return this.#arr.toString();
  }
}
