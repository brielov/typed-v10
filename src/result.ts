import { isFunction, isObject } from "./guards";
import type { Option } from "./option";
import { None, Some } from "./option";
import { raise } from "./util";

const OkSymbol = Symbol("Ok");
const ErrSymbol = Symbol("Err");

/**
 * Represents a successful result with a value of type T
 * @template T The type of the value
 */
type Ok<T> = { readonly _tag: typeof OkSymbol; readonly value: T };

/**
 * Represents an erroneous result with an error of type E
 * @template E The type of the error
 */
type Err<E> = { readonly _tag: typeof ErrSymbol; readonly error: E };

/**
 * Represents a result that can be either Ok with a value of type T, or Err with an error of type E
 * @template T The type of the value
 * @template E The type of the error
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Constructs an Ok result with a given value of type T
 * @template T The type of the value
 * @param value The value to wrap in an Ok result
 * @returns An Ok result with the given value
 */
export const Ok = <T>(value: T): Ok<T> => ({ _tag: OkSymbol, value });

/**
 * Constructs an Err result with a given error of type E
 * @template E The type of the error
 * @param error The error to wrap in an Err result
 * @returns An Err result with the given error
 */
export const Err = <E>(error: E): Err<E> => ({ _tag: ErrSymbol, error });

/**
 * Returns whether the given Result object is of type Ok.
 *
 * @template T, E
 * @param {Result<T, E>} result - The Result object to check.
 * @returns {result is Ok<T>} - Whether the given Result object is of type Ok.
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> =>
  result._tag === OkSymbol;

/**
 * Returns whether the given Result object is of type Err.
 *
 * @template T, E
 * @param {Result<T, E>} result - The Result object to check.
 * @returns {result is Err<E>} - Whether the given Result object is of type Err.
 */
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> =>
  result._tag === ErrSymbol;

/**
 * Calls the appropriate function depending on whether the given Result object is of type Ok or Err.
 *
 * @template T, E, O
 * @param {Result<T, E>} result - The Result object to match.
 * @param {(value: T) => O} onOk - The function to call if the Result is Ok.
 * @param {(value: E) => O} onErr - The function to call if the Result is Err.
 * @returns {O} - The result of the function that was called.
 */
export const match = <T, E, O>(
  result: Result<T, E>,
  onOk: (value: T) => O,
  onErr: (value: E) => O,
): O => (isOk(result) ? onOk(result.value) : onErr(result.error));

/**
 * Returns whether the given Result object is of type Ok and satisfies the given predicate function.
 *
 * @template T, E
 * @param {Result<T, E>} result - The Result object to check.
 * @param {(value: T) => boolean} f - The predicate function to check against the value in the Ok variant.
 * @returns {boolean} - Whether the given Result object is of type Ok and satisfies the given predicate function.
 */
export const isOkAnd = <T, E>(result: Result<T, E>, f: (value: T) => boolean) =>
  isOk(result) && f(result.value);

/**
 * Returns whether the given Result object is of type Err and satisfies the given predicate function.
 *
 * @template T, E
 * @param {Result<T, E>} result - The Result object to check.
 * @param {(value: E) => boolean} f - The predicate function to check against the value in the Err variant.
 * @returns {boolean} - Whether the given Result object is of type Err and satisfies the given predicate function.
 */
export const isErrAnd = <T, E>(
  result: Result<T, E>,
  f: (value: E) => boolean,
) => isErr(result) && f(result.error);

/**
 * Returns the second Result object if the first Result object is of type Ok, otherwise returns the first Result object.
 *
 * @template T, E, U
 * @param {Result<T, E>} r1 - The first Result object.
 * @param {Result<U, E>} r2 - The second Result object.
 * @returns {Result<T | U, E>} - The second Result object if the first Result object is of type Ok, otherwise the first Result object.
 */
export const and = <T, E, U>(r1: Result<T, E>, r2: Result<U, E>) =>
  isOk(r1) ? r2 : r1;

/**
 * Takes a `Result` and a function `f` that maps the value of the `Result` to a new `Result`.
 * If the `Result` is an `Ok`, it returns the result of applying `f` to the value.
 * If the `Result` is an `Err`, it returns the `Err`.

 * @param res The `Result` to apply `f` to
 * @param f The function to map the value of the `Result`
 * @returns The result of applying `f` to the value of the `Result`, or the `Err`
 */
export const andThen = <T, E, U>(
  res: Result<T, E>,
  f: (value: T) => Result<U, E>,
) => (isOk(res) ? f(res.value) : res);

/**
 * Takes a `Result` and a message `msg`. If the `Result` is an `Ok`, it returns the value.
 * If the `Result` is an `Err`, it raises an error with the given message.
 *
 * @param res The `Result` to get the value of
 * @param msg The error message to raise if the `Result` is an `Err`
 * @returns The value of the `Ok` or raises an error with the given message
 */
export const expect = <T, E>(res: Result<T, E>, msg: string) =>
  isOk(res) ? res.value : raise(msg);

/**
 * Takes a `Result` and a message `msg`. If the `Result` is an `Err`, it returns the error.
 * If the `Result` is an `Ok`, it raises an error with the given message.

 * @param res The `Result` to get the error of
 * @param msg The error message to raise if the `Result` is an `Ok`
 * @returns The error of the `Err` or raises an error with the given message
 */
export const expectErr = <T, E>(res: Result<T, E>, msg: string) =>
  isErr(res) ? res.error : raise(msg);

/**
 * Takes a `Result` and a function `f` that maps the value of the `Result` to a new value.
 * If the `Result` is an `Ok`, it returns a new `Ok` with the result of applying `f` to the value.
 * If the `Result` is an `Err`, it returns the `Err`.

 * @param res The `Result` to apply `f` to
 * @param f The function to map the value of the `Result`
 * @returns A new `Ok` with the result of applying `f` to the value of the `Result`, or the `Err`
 */
export const map = <T, E, U>(res: Result<T, E>, f: (value: T) => U) =>
  isOk(res) ? Ok(f(res.value)) : res;

/**
 * Takes a `Result` and a function `f` that maps the error of the `Result` to a new error.
 * If the `Result` is an `Err`, it returns a new `Err` with the result of applying `f` to the error.
 * If the `Result` is an `Ok`, it returns the `Ok`.
 *
 * @param res The `Result` to apply `f` to
 * @param f The function to map the error of the `Result`
 * @returns A new `Err` with the result of applying `f` to the error of the `Result`, or the `Ok`
 */
export const mapErr = <T, E, F>(res: Result<T, E>, f: (value: E) => F) =>
  isErr(res) ? Err(f(res.error)) : res;

/**
 * Maps a `Result<T, E>` to `U` by applying a function to the `T` value or returning a default value `def` if `res` is an error.
 *
 * @template T, E, U
 * @param {Result<T, E>} res - The `Result` to map.
 * @param {U} def - The default value to use if `res` is an error.
 * @param {(value: T) => U} f - The function to apply to the `T` value if `res` is not an error.
 * @returns {U} - The resulting value after mapping.
 */
export const mapOr = <T, E, U>(res: Result<T, E>, def: U, f: (value: T) => U) =>
  isOk(res) ? f(res.value) : def;

/**
 * Maps a `Result<T, E>` to `U` by applying a function to the `T` value or returning the result of `def` applied to the `E` value if `res` is an error.
 *
 * @template T, E, U
 * @param {Result<T, E>} res - The `Result` to map.
 * @param {(value: E) => U} def - The function to apply to the `E` value if `res` is an error.
 * @param {(value: T) => U} f - The function to apply to the `T` value if `res` is not an error.
 * @returns {U} - The resulting value after mapping.
 */
export const mapOrElse = <T, E, U>(
  res: Result<T, E>,
  def: (value: E) => U,
  f: (value: T) => U,
): U => (isOk(res) ? f(res.value) : def(res.error));

/**
 * Returns the first `Result` if it is `Ok`, otherwise returns the second `Result`.
 *
 * @template T, E, F
 * @param {Result<T, E>} r1 - The first `Result`.
 * @param {Result<T, F>} r2 - The second `Result`.
 * @returns {Result<T, F>} - The resulting `Result`.
 */
export const or = <T, E, F>(r1: Result<T, E>, r2: Result<T, F>): Result<T, F> =>
  isOk(r1) ? r1 : r2;

/**
 * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to the `E` value or returning the original `Result` if it is `Ok`.
 *
 * @template T, E, F
 * @param {Result<T, E>} res - The `Result` to map.
 * @param {(value: E) => Result<T, F>} f - The function to apply to the `E` value if `res` is an error.
 * @returns {Result<T, F>} - The resulting `Result`.
 */
export const orElse = <T, E, F>(
  res: Result<T, E>,
  f: (value: E) => Result<T, F>,
): Result<T, F> => (isOk(res) ? res : f(res.error));

/**
 * Returns the value contained in an `Ok` variant of a `Result`.
 *
 * @template T, E
 * @param {Result<T, E>} res - The `Result` variant to unwrap.
 * @returns {T} - The value contained in the `Ok` variant.
 * @throws If the variant is an `Err`.
 */
export const unwrap = <T, E>(res: Result<T, E>): T =>
  isErr(res) ? raise("called unwrap on an `Err` value") : res.value;

/**
 * Returns the error contained in an `Err` variant of a `Result`.
 *
 * @template T, E
 * @param {Result<T, E>} res - The `Result` variant to unwrap.
 * @returns {E} - The error contained in the `Err` variant.
 * @throws If the variant is an `Ok`.
 */
export const unwrapErr = <T, E>(res: Result<T, E>): E =>
  isOk(res) ? raise("called unwrapErr on an `Ok` value") : res.error;

/**
 * Returns the value contained in an `Ok` variant of a `Result`. If the variant is
 * an `Err`, it returns the specified default value.
 *
 * @template T, E
 * @param {Result<T, E>} res - The `Result` variant to unwrap.
 * @param {T} def - The default value to return if the variant is an `Err`.
 * @returns {T} - The value contained in the `Ok` variant or the default value.
 */
export const unwrapOr = <T, E>(res: Result<T, E>, def: T): T =>
  isOk(res) ? res.value : def;

/**
 * Returns the value contained in an `Ok` variant of a `Result`. If the variant is
 * an `Err`, it returns the value returned by the specified function.
 *
 * @template T, E
 * @param {Result<T, E>} res - The `Result` variant to unwrap.
 * @param {(value: E) => T} f - The function that returns a value if the variant is an `Err`.
 * @returns {T} - The value contained in the `Ok` variant or the value returned by the function.
 */
export const unwrapOrElse = <T, E>(res: Result<T, E>, f: (value: E) => T): T =>
  isOk(res) ? res.value : f(res.error);

/**
 * Converts a `Result` variant to an `Option` variant.
 *
 * @template T, E
 * @param {Result<T, E>} res - The `Result` variant to convert.
 * @returns {Option<T>} - The `Option` variant.
 */
export const ok = <T, E>(res: Result<T, E>): Option<T> =>
  isOk(res) ? Some(res.value) : None;

/**
 * Converts the result of calling a function to a `Result` variant. If the function
 * throws an exception, it returns an `Err` variant.
 *
 * @template T
 * @param {() => T} fn - The function to call.
 * @returns {Result<T, unknown>} - The `Result` variant.
 */
export const into = <T>(fn: () => T): Result<T, unknown> => {
  try {
    return Ok(fn());
  } catch (err) {
    return Err(err);
  }
};

/**
 * Wraps a Promise or Promise-returning function in a `Result` object.
 * If the Promise resolves successfully, it returns an `Ok` result with the resolved value.
 * If the Promise rejects, it returns an `Err` result with the error object.
 * If a Promise-returning function is passed in, it will be called and awaited before being wrapped.
 *
 * @param {Promise<T> | (() => Promise<T>)} promiseOrFn - The Promise or Promise-returning function to wrap.
 * @returns {Promise<Result<T, unknown>>} A Promise that resolves with a `Result` object.
 */
export const intoAsync = <T>(
  promiseOrFn: Promise<T> | (() => Promise<T>),
): Promise<Result<T, unknown>> => {
  if (isFunction(promiseOrFn)) return intoAsync(promiseOrFn());
  return promiseOrFn.then(Ok).catch(Err);
};

/**
 * Determines whether a value is a result.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} - `true` if the value is a result; otherwise, `false`.
 */
export const isResult = (value: unknown): value is Result<unknown, unknown> =>
  isObject(value) &&
  "_tag" in value &&
  (value._tag === OkSymbol || value._tag === ErrSymbol);
