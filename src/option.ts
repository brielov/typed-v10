import { isNil, isObject } from "./guards";
import type { Result } from "./result";
import { Err, Ok } from "./result";
import type { Maybe } from "./types";
import { raise } from "./util";

const SomeSymbol = Symbol("some");
const NoneSymbol = Symbol("none");

/**
 * Represents a value that may or may not be present.
 *
 * If the value is present, it is wrapped in a `Some` object.
 * If the value is absent, a `None` object is used instead.
 */
type Some<T> = { readonly _tag: typeof SomeSymbol; readonly value: T };

/**
 * Represents an absent value.
 */
type None = { readonly _tag: typeof NoneSymbol };

/**
 * Represents an optional value that may or may not be present.
 */
export type Option<T> = Some<T> | None;

/**
 * Creates a `Some` object that wraps the given value.
 *
 * @param value - The value to be wrapped.
 * @returns A `Some` object that contains the given value.
 */
export const Some = <T>(value: T): Some<T> => ({
  _tag: SomeSymbol,
  value,

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  toJSON: () => value,
});

/**
 * An object that represents an absent value.
 */
export const None: None = Object.freeze({
  _tag: NoneSymbol,

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  toJSON: () => null,
});

/**
 * Determines whether the given `Option` object is a `Some`.
 *
 * @param opt - The `Option` object to check.
 * @returns `true` if the object is a `Some`, `false` otherwise.
 */
export const isSome = <T>(opt: Option<T>): opt is Some<T> =>
  opt._tag === SomeSymbol;

/**
 * Determines whether the given `Option` object is a `None`.
 *
 * @param opt - The `Option` object to check.
 * @returns `true` if the object is a `None`, `false` otherwise.
 */
export const isNone = <T>(opt: Option<T>): opt is None =>
  opt._tag === NoneSymbol;

/**
 * Matches the given `Option` object against the provided functions.
 *
 * If the object is a `Some`, the `onSome` function is called with the wrapped value.
 * If the object is a `None`, the `onNone` function is called with no arguments.
 *
 * @param opt - The `Option` object to match against.
 * @param onSome - The function to call if the object is a `Some`.
 * @param onNone - The function to call if the object is a `None`.
 * @returns The result of calling either `onSome` or `onNone`.
 */
export const match = <T, O>(
  opt: Option<T>,
  onSome: (value: T) => O,
  onNone: () => O,
): O => (isSome(opt) ? onSome(opt.value) : onNone());

/**
 * Returns the second `Option` if both `Option`s are `Some`s.
 * If the first `Option` is a `None`, then it is returned instead.
 *
 * @param opt - The first `Option` to be evaluated.
 * @param optb - The second `Option` to be returned if both `Option`s are `Some`s.
 * @returns Either the second `Option` or the first `Option` if it is a `None`.
 */
export const and = <T, U>(opt: Option<T>, optb: Option<U>): Option<U> =>
  isSome(opt) ? optb : opt;

/**
 * Calls the given function `f` with the wrapped value of `opt` if it is a `Some`,
 * otherwise returns `opt`.
 *
 * @param opt - The `Option` object to be evaluated.
 * @param f - The function to call with the wrapped value of `opt` if it is a `Some`.
 * @returns Either the result of calling `f` with the wrapped value of `opt` or `opt`.
 */
export const andThen = <T, U>(
  opt: Option<T>,
  f: (value: T) => Option<U>,
): Option<U> => (isSome(opt) ? f(opt.value) : opt);

/**
 * Returns the wrapped value of `opt` if it is a `Some`,
 * otherwise throws an error with the given `msg`.
 *
 * @param opt - The `Option` object to be evaluated.
 * @param msg - The error message to throw if `opt` is a `None`.
 * @returns The wrapped value of `opt`.
 * @throws An error with the given `msg` if `opt` is a `None`.
 */
export const expect = <T>(opt: Option<T>, msg: string): T =>
  isSome(opt) ? opt.value : raise(msg);

/**
 * Returns `None` if the wrapped value of `opt` does not satisfy the given `predicate`,
 * otherwise returns `opt`.
 *
 * @param opt - The `Option` object to be evaluated.
 * @param predicate - The predicate to check against the wrapped value of `opt`.
 * @returns Either `None` or `opt` depending on whether the wrapped value satisfies the `predicate`.
 */
export const filter = <T>(
  opt: Option<T>,
  predicate: (value: T) => boolean,
): Option<T> => (isSome(opt) && predicate(opt.value) ? opt : None);

/**
 * Determines whether the wrapped value of `opt` is a `Some` and satisfies the given `predicate`.
 *
 * @param opt - The `Option` object to be evaluated.
 * @param f - The predicate to check against the wrapped value of `opt`.
 * @returns `true` if the wrapped value satisfies the `predicate`, `false` otherwise.
 */
export const isSomeAnd = <T>(opt: Option<T>, f: (value: T) => boolean) =>
  isSome(opt) && f(opt.value);

/**
 * Maps an Option<T> to Option<U> by applying a function to the value inside Some<T>,
 * returning a new Some<U>. If the input is None, returns None.
 * @param opt - The Option<T> to map.
 * @param f - The function to apply to the value inside Some<T>.
 * @returns A new Option<U> with the mapped value, or None.
 */
export const map = <T, U>(opt: Option<T>, f: (value: T) => U): Option<U> =>
  isSome(opt) ? Some(f(opt.value)) : opt;

/**
 * Maps an Option<T> to U by applying a function to the value inside Some<T>.
 * If the input is None, returns the default value `def`.
 * @param opt - The Option<T> to map.
 * @param def - The default value to return if the input is None.
 * @param f - The function to apply to the value inside Some<T>.
 * @returns The mapped value, or `def` if the input is None.
 */
export const mapOr = <T, U>(opt: Option<T>, def: U, f: (value: T) => U): U =>
  isSome(opt) ? f(opt.value) : def;

/**
 * Maps an Option<T> to U by applying a function to the value inside Some<T>.
 * If the input is None, returns the result of calling the `def` function.
 * @param opt - The Option<T> to map.
 * @param def - The function to call and return its result if the input is None.
 * @param f - The function to apply to the value inside Some<T>.
 * @returns The mapped value, or the result of calling `def` if the input is None.
 */
export const mapOrElse = <T, U>(
  opt: Option<T>,
  def: () => U,
  f: (value: T) => U,
): U => (isSome(opt) ? f(opt.value) : def());

/**
 * Converts an Option<T> to a Result<T, E>, where the Err variant holds the given error value `e`.
 * If the input is None, returns Err(e).
 * @param opt - The Option<T> to convert to Result<T, E>.
 * @param e - The error value to use if the input is None.
 * @returns A new Result<T, E> with Ok(T) if the input is Some<T>, or Err(e) if the input is None.
 */
export const okOr = <T, E>(opt: Option<T>, e: E): Result<T, E> =>
  isSome(opt) ? Ok(opt.value) : Err(e);

/**
 * Converts an Option<T> to a Result<T, E>, where the Err variant is the result of calling the `e` function.
 * If the input is None, returns Err(e()).
 * @param opt - The Option<T> to convert to Result<T, E>.
 * @param e - The function to call and return its result as the Err value if the input is None.
 * @returns A new Result<T, E> with Ok(T) if the input is Some<T>, or Err(e()) if the input is None.
 */
export const okOrElse = <T, E>(opt: Option<T>, e: () => E): Result<T, E> =>
  isSome(opt) ? Ok(opt.value) : Err(e());

/**
 * Returns `opt` if it contains a value, otherwise returns `optb`.
 *
 * @param {Option<T>} opta - The input option to evaluate.
 * @param {Option<T>} optb - The fallback option to return if `opt` is None.
 * @returns {Option<T>} The resulting option value.
 * @template T
 */
export const or = <T>(opta: Option<T>, optb: Option<T>): Option<T> =>
  isSome(opta) ? opta : optb;

/**
 * Calls `f` and returns the result if `opt` is None, otherwise returns `opt`.
 *
 * @param {Option<T>} opt - The input option to evaluate.
 * @param {() => Option<T>} f - The function to call and return the result of if `opt` is None.
 * @returns {Option<T>} The resulting option value.
 * @template T
 */
export const orElse = <T>(opt: Option<T>, f: () => Option<T>): Option<T> =>
  isSome(opt) ? opt : f();

/**
 * Unwraps the `Some` variant of an option, otherwise raises an error.

 * @param opt - The option to unwrap.
 * @returns The value inside the `Some` variant of the option.
 * @throws If the option is a `None`.
 */
export const unwrap = <T>(opt: Option<T>): T =>
  isSome(opt) ? opt.value : raise("called Option.unwrap on a `None` value");

/**
 * Unwraps the `Some` variant of an option, or returns a default value if the option is a `None`.

 * @param opt - The option to unwrap.
 * @param def - The default value to return if the option is a `None`.
 * @returns The value inside the `Some` variant of the option, or the default value.
 */
export const unwrapOr = <T>(opt: Option<T>, def: T): T =>
  isSome(opt) ? opt.value : def;

/**
 * Unwraps the `Some` variant of an option, or evaluates a function to return a default value if the option is a `None`.
 *
 * @param opt - The option to unwrap.
 * @param def - A function that returns the default value to use if the option is a `None`.
 * @returns The value inside the `Some` variant of the option, or the default value returned by the function.
 */
export const unwrapOrElse = <T>(opt: Option<T>, def: () => T): T =>
  isSome(opt) ? opt.value : def();

/**
 * Converts a value of type `Maybe<T>` to an `Option<T>`.

 * @param value - The value to convert.
 * @returns An `Option<T>` with the value if the input is not `null` or `undefined`, otherwise a `None`.
 */
export const into = <T>(value: Maybe<T>): Option<T> =>
  isNil(value) ? None : Some(value);

/**
 * Determines whether a value is an option.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} - `true` if the value is an option; otherwise, `false`.
 */
export const isOption = (value: unknown): value is Option<unknown> =>
  Object.is(value, None) ||
  (isObject(value) && "_tag" in value && value._tag === SomeSymbol);
