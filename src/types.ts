/**
 * A type that represents a value that can be null or undefined.
 */
export type Nil = null | undefined;

/**
 * A type that represents a value that can be of type T or null/undefined.
 *
 * @template T - The type of the value.
 */
export type Maybe<T> = T | Nil;

/**
 * A type that represents a plain object with properties of unknown values.
 */
export type PlainObject = { [key: PropertyKey]: unknown };

/**
 * A type that represents any function that accepts any number of arguments and returns any value.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunc = (...args: any[]) => any;

/**
 * A type that represents primitive values in JavaScript.
 */
export type Primitive =
  | bigint
  | boolean
  | null
  | number
  | string
  | symbol
  | undefined;

/**
 * A type that represents literal values in TypeScript.
 */
export type Literal = string | number | boolean | null;
