import type { AnyFunc, Maybe, Nil, PlainObject, Primitive } from "./types";

type Type = {
  bigint: bigint;
  boolean: boolean;
  function: AnyFunc;
  number: number;
  object: object;
  string: string;
  symbol: symbol;
  undefined: undefined;
};

/**
 * A factory function that returns a type guard for a specified type.
 *
 * @param type The name of the type to create a type guard for.
 * @returns A type guard function that checks if the input is of the specified type.
 */
const type =
  <K extends keyof Type>(type: K) =>
  (input: unknown): input is Type[K] =>
    typeof input === type;

/**
 * A type guard that checks if the input is a string.

 * @param input The value to be checked.
 * @returns True if the input is a string, false otherwise.
 */
export const isString = type("string");

/**
 * A type guard that checks if the input is a number.
 *
 * @param input The value to be checked.
 * @returns True if the input is a number, false otherwise.
 */
export const isNumber = type("number");

/**
 * A type guard that checks if the input is a boolean.
 *
 * @param input The value to be checked.
 * @returns True if the input is a boolean, false otherwise.
 */
export const isBoolean = type("boolean");

/**
 * A type guard that checks if the input is a bigint.
 *
 * @param input The value to be checked.
 * @returns True if the input is a bigint, false otherwise.
 */
export const isBigInt = type("bigint");

/**
 * A type guard that checks if the input is a symbol.
 *
 * @param input The value to be checked.
 * @returns True if the input is a symbol, false otherwise.
 */
export const isSymbol = type("symbol");

/**
 * A type guard that checks if the input is a function.
 *
 * @param input The value to be checked.
 * @returns True if the input is a function, false otherwise.
 */
export const isFunction = type("function");

/**
 * A type guard that checks if the input is undefined.
 *
 * @param input The value to be checked.
 * @returns True if the input is undefined, false otherwise.
 */
export const isUndefined = type("undefined");

/**
 * A type guard that checks if the input is an object.
 *
 * @param input The value to be checked.
 * @returns True if the input is an object, false otherwise.
 */
export const isObject = type("object");

/**
 * A type guard that checks if the input is null.
 *
 * @param value The value to be checked.
 * @returns True if the input is null, false otherwise.
 */
export const isNull = (value: unknown): value is null => value === null;

const PRIMITIVES = [
  isString,
  isNumber,
  isBoolean,
  isBigInt,
  isNull,
  isUndefined,
  isBigInt,
  isSymbol,
];

/**
 * Checks whether the given value is a primitive value.
 *
 * @param value The value to check.
 * @returns `true` if the value is a primitive; otherwise, `false`.
 */
export const isPrimitive = (value: unknown): value is Primitive =>
  PRIMITIVES.some((f) => f(value));

/**
 * Checks whether the given value is null or undefined.
 *
 * @param value The value to check.
 * @returns `true` if the value is null or undefined; otherwise, `false`.
 */
export const isNil = (value: unknown): value is Nil =>
  isNull(value) || isUndefined(value);

/**
 * Checks whether the given value is an instance of the specified constructor.
 *
 * @param constructor The constructor function to check against.
 * @param value The value to check.
 * @returns `true` if the value is an instance of the constructor; otherwise, `false`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isInstanceOf = <T extends new (...args: any[]) => any>(
  constructor: T,
  value: unknown,
): value is InstanceType<T> => value instanceof constructor;

/**
 * Checks whether the given value is a Date object.
 *
 * @param value The value to check.
 * @returns `true` if the value is a Date object; otherwise, `false`.
 */
export const isDate = (value: unknown): value is Date =>
  isInstanceOf(Date, value);

/**
 * Checks whether the given value is an array.
 *
 * @param value The value to check.
 * @returns `true` if the value is an array; otherwise, `false`.
 */
export const isArray = (value: unknown): value is unknown[] =>
  Array.isArray(value);

/**
 * Checks whether the given value is a plain object.
 *
 * @param value The value to check.
 * @returns `true` if the value is a plain object; otherwise, `false`.
 */
export const isPlainObject = (value: unknown): value is PlainObject => {
  if (isObject(value) && !isNull(value)) {
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype;
  }
  return false;
};

/**
 * Determines whether a value is iterable.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} - `true` if the value is iterable; otherwise, `false`.
 */
export const isIterable = (value: unknown): value is Iterable<unknown> => {
  if (isNil(value)) return false;
  const obj = Object(value);
  return Symbol.iterator in obj;
};

/**
 * Determines whether a value is present (i.e., not `null` or `undefined`).
 *
 * @template T
 * @param {Maybe<T>} value - The value to check.
 * @returns {value is T} - `true` if the value is present; otherwise, `false`.
 */
export const isPresent = <T>(value: Maybe<T>): value is T => !isNil(value);

/**
 * Determines whether a value is a regular expression.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} - `true` if the value is a regular expression; otherwise, `false`.
 */
export const isRegExp = (value: unknown): value is RegExp =>
  isInstanceOf(RegExp, value);

/**
 * Determines whether a value is a valid number (i.e., not `NaN`).

 * @param {unknown} value - The value to check.
 * @returns {boolean} - `true` if the value is a valid number; otherwise, `false`.
 */
export const isValidNumber = (value: unknown): value is number =>
  isNumber(value) && Number.isFinite(value);

/**
 * Determines whether a value is a valid date.

 * @param {unknown} value - The value to check.
 * @returns {boolean} - `true` if the value is a valid date; otherwise, `false`.
 */
export const isValidDate = (value: unknown): value is Date =>
  isDate(value) && isValidNumber(value.getTime());

/**
 * Checks if a number is Infinity.
 *
 * @param num The number to check.
 * @returns Whether the number is infinity or not.
 */
export const isInfinity = (value: number): boolean =>
  Math.abs(value) === Infinity;

/**
 * Checks if a number is positive.
 *
 * @param num The number to check.
 * @returns Whether the number is positive or not.
 */
export const isPositive = (num: number): boolean => num > 0;

/**
 * Checks if a number is negative.
 *
 * @param num The number to check.
 * @returns Whether the number is negative or not.
 */
export const isNegative = (num: number): boolean => !isPositive(num);

/**
 * Checks if a number is an integer.
 *
 * @param num The number to check.
 * @returns Whether the number is an integer or not.
 */
export const isInteger = (num: number): boolean => Number.isInteger(num);

/**
 * Checks if a number is a floating-point number.
 *
 * @param num The number to check.
 * @returns Whether the number is a floating-point number or not.
 */
export const isFloat = (num: number): boolean => !isInteger(num);

/**
 * Checks if a number is even.
 * @param num The number to check.
 * @returns Whether the number is even or not.
 */
export const isEven = (num: number): boolean => num % 2 === 0;

/**
 * Checks if a number is odd.
 * @param num The number to check.
 * @returns Whether the number is odd or not.
 */
export const isOdd = (num: number): boolean => !isEven(num);

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Checks if a string is a valid email.
 * @param num The string to check.
 * @returns Whether the string is an email or not.
 */
export const isEmail = (str: string): boolean =>
  str.length <= 320 && EMAIL_REGEX.test(str);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Checks if a string is a valid uuid.
 * @param num The string to check.
 * @returns Whether the string is a uuid or not.
 */
export const isUUID = (uuid: string): boolean => UUID_REGEX.test(uuid);
