import {
  isArray,
  isBoolean,
  isEmail,
  isNil,
  isNumber,
  isPlainObject,
  isString,
  isUUID,
  isValidDate,
  isValidNumber,
} from "./guards";
import { List } from "./list";
import type { Option } from "./option";
import { None, Some } from "./option";
import type { Result } from "./result";
import { Err, Ok } from "./result";
import type { Literal, Maybe, PlainObject } from "./types";
import { Type, getTypeOf } from "./util";

/**
 * A Parser is a function that takes an input value of type I and returns a Result object
 * containing either the parsed output value of type O or a ParserError object if parsing failed.
 * @template {unknown} I - The type of the input value.
 * @template {unknown} O - The type of the output value.
 * @typedef {function(I): Result<O, ParseError>} Parser
 */
export type Parser<O = unknown, I = unknown> = (
  input: I,
) => Result<O, ParseError>;

/**
 * The Infer type extracts the output type U of a Parser<T> type.
 * @template {Parser} T - The type to infer from.
 * @typedef {infer U} Infer
 */
export type Infer<T> = T extends Parser<infer U> ? U : never;

/**
 * The Shape type is a generic type that takes an object type T as input and returns a new type where each value in the original object is wrapped in a Parser type.
 * The resulting type is an object with the same keys as the original object but with each value wrapped in a Parser.
 * @template {T extends PlainObject} - The type of the resulting shape.
 */
type Shape<T extends PlainObject> = { [K in keyof T]: Parser<T[K]> };

/**
 * Borrowed from `superstruct`
 * @see https://github.com/ianstormtaylor/superstruct/blob/28e0b32d5506a7c73e63f7e718b23977e58aac18/src/utils.ts#L393
 */
export type InferTuple<
  Tuple extends Parser[],
  Length extends number = Tuple["length"],
> = Length extends Length
  ? number extends Length
    ? Tuple
    : _InferTuple<Tuple, Length, []>
  : never;

export type _InferTuple<
  Tuple extends Parser[],
  Length extends number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Accumulated extends any[],
  Index extends number = Accumulated["length"],
> = Index extends Length
  ? Accumulated
  : _InferTuple<Tuple, Length, [...Accumulated, Infer<Tuple[Index]>]>;

/**
 * Borrowed from `superstruct`
 * @see https://github.com/ianstormtaylor/superstruct/blob/28e0b32d5506a7c73e63f7e718b23977e58aac18/src/utils.ts#L200
 */
export type UnionToIntersection<U> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (U extends any ? (arg: U) => any : never) extends (arg: infer I) => void
    ? I
    : never;

/**
 * The ParserError type represents an error that can occur during parsing.
 * @typedef {Object} ParserError
 * @property {string} actual - The actual type of the input.
 * @property {string} expected - The expected type of the input.
 * @property {unknown} input - The input value that caused the error.
 * @property {string} message - A message describing the error.
 * @property {string[]} path - An array representing the path to the value that caused the error.
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public readonly expected: string,
    public readonly actual: string,
    public readonly input: unknown,
    public readonly path: string[] = [],
  ) {
    super(message);
  }
}

/**
 * Creates a ParserError object for a given expected type and input value.

 * @param {string} expected - The expected type of the input value.
 * @param {unknown} input - The input value that caused the error.
 * @returns {ParseError} A new ParserError object.
 */
const typeErr = (expected: string, input: unknown): ParseError => {
  const actual = getTypeOf(input);
  return new ParseError(
    `Type '${actual}' is not assignable to type '${expected}'`,
    expected,
    actual,
    input,
  );
};

/**
 * Returns a parser that validates and returns a string from the input.
 *
 * @param {Object} [opts] - Optional configuration options.
 * @param {boolean} [opts.coerce=false] - Whether to coerce the input to a string if it's not already.
 *
 * @returns {Parser<string>} A parser that returns a string if the input is a valid string, or an error otherwise.
 */
export const string =
  (opts?: { coerce?: boolean }): Parser<string> =>
  (input) => {
    if (opts?.coerce) input = String(input);
    return isString(input) ? Ok(input) : Err(typeErr(Type.String, input));
  };

/**
 * Returns a parser that validates and returns a valid number from the input.
 *
 * @param {Object} [opts] - Optional configuration options.
 * @param {boolean} [opts.coerce=false] - Whether to coerce the input to a number if it's not already.
 *
 * @returns {Parser<number>} A parser that returns a number if the input is a valid number, or an error otherwise.
 */
export const number =
  (opts?: { coerce?: boolean }): Parser<number> =>
  (input) => {
    if (opts?.coerce) input = Number(input);
    return isValidNumber(input) ? Ok(input) : Err(typeErr(Type.Number, input));
  };

/**
 * Returns a parser that validates and returns a boolean from the input.
 *
 * @returns {Parser<boolean>} A parser that returns a boolean if the input is a valid boolean, or an error otherwise.
 */
export const boolean = (): Parser<boolean> => (input) =>
  isBoolean(input) ? Ok(input) : Err(typeErr(Type.Boolean, input));

/**
 * Returns a parser function that converts the input value into a Date object if it is valid.
 *
 * @param {object} [opts] - Optional configuration object.
 * @param {boolean} [opts.coerce=false] - Whether to coerce the input into a Date object if it is a string or a number.
 * @returns {Parser<Date>} A parser function that returns an Ok result containing a Date object if the input is valid, otherwise an Err result.
 */
export const date =
  (opts?: { coerce?: boolean }): Parser<Date> =>
  (input) => {
    if (opts?.coerce && (isString(input) || isNumber(input))) {
      input = new Date(input);
    }
    return isValidDate(input) ? Ok(input) : Err(typeErr(Type.Date, input));
  };

/**
 * Returns a parser that returns an Option type.
 *
 * @template T - The type of the parsed value.
 * @param {Parser<T>} parser - A parser function.
 * @returns {Parser<Option<T>>} A parser function that returns an Ok result containing Some value if the input is not null or undefined, otherwise Ok(None).
 */
export const optional =
  <T>(parser: Parser<T>): Parser<Option<T>> =>
  (input) =>
    isNil(input) ? Ok(None) : parser(input).map(Some);

/**
 * Returns a parser function that returns a default value if the input is null or undefined.
 *
 * @template T - The type of the parsed value.
 * @param {Parser<T>} parser - A parser function.
 * @param {T} def - The default value to use.
 * @returns {Parser<T>} A parser function that returns an Ok result containing the parsed value if the input is not null or undefined, otherwise Ok(def).
 */
export const defaulted =
  <T>(parser: Parser<T>, def: T): Parser<T> =>
  (input) =>
    isNil(input) ? Ok(def) : parser(input);

export const maybe =
  <T>(parser: Parser<T>): Parser<Maybe<T>> =>
  (input) =>
    isNil(input) ? Ok(input) : parser(input);

/**
 * Returns a parser that parses an array of items of type `T` from the input using the given `parser`.
 *
 * @template T The type of items in the array.
 * @param {Parser<T>} parser The parser to use to parse each item in the array.
 * @returns {Parser<T[]>} A parser that parses an array of `T` items from the input.
 */
export const array =
  <T>(parser: Parser<T>): Parser<T[]> =>
  (input) => {
    if (!isArray(input)) return Err(typeErr(Type.Array, input));
    const arr: T[] = Array(input.length);
    for (let i = 0; i < arr.length; i++) {
      const res = parser(input[i]);
      if (res.isErr()) {
        const err = res.unwrapErr();
        err.path.unshift(i.toString());
        return Err(err);
      }
      arr[i] = res.unwrap();
    }
    return Ok(arr);
  };

/**
 * Returns a parser that parses an object of a given `Shape` from the input.
 *
 * @template T A `Shape` object describing the shape of the object to parse.
 * @param {T} shape The `Shape` object describing the shape of the object to parse.
 * @returns {Parser<InferShape<T>>} A parser that parses an object of type `InferShape<T>` from the input.
 */
export const object =
  <T extends PlainObject>(shape: Shape<T>): Parser<T> =>
  (input) => {
    if (!isPlainObject(input)) return Err(typeErr(Type.Object, input));
    const obj = Object.create(null);
    for (const key in shape) {
      const res = shape[key](input[key as string]);
      if (res.isErr()) {
        const err = res.unwrapErr();
        err.path.unshift(key);
        return Err(err);
      }
      obj[key] = res.unwrap();
    }
    return Ok(obj);
  };

/**
 * Returns a parser that parses a record (i.e., an object whose keys are of type `K` and values of type `T`)
 * from the input using the given `keyParser` and `valueParser`.
 *
 * @template K The type of keys in the record.
 * @template T The type of values in the record.
 * @param {Parser<K>} keyParser The parser to use to parse the keys of the record.
 * @param {Parser<T>} valueParser The parser to use to parse the values of the record.
 * @returns {Parser<Record<K, T>>} A parser that parses a record of keys of type `K` and values of type `T`
 * from the input.
 */
export const record =
  <K extends string, T>(
    keyParser: Parser<K>,
    valueParser: Parser<T>,
  ): Parser<Record<K, T>> =>
  (input) => {
    if (!isPlainObject(input)) return Err(typeErr(Type.Object, input));
    const obj = Object.create(null);
    for (const key in input) {
      const kres = keyParser(key);
      if (kres.isErr()) {
        const err = kres.unwrapErr();
        err.path.unshift(key);
        return Err(err);
      }
      const vres = valueParser(input[key]);
      if (vres.isErr()) {
        const err = vres.unwrapErr();
        err.path.unshift(key);
        return Err(err);
      }
      obj[kres.unwrap()] = vres.unwrap();
    }
    return Ok(obj);
  };

/**
 * Chains together a parser and a list of functions to apply to its result.
 * The result of the last function is the final output of the chain.
 *
 * @param parser - The parser to apply the chain to.
 * @param fns - The list of functions to apply to the parser result.
 * @returns A parser that applies the chain of functions to the parser result.
 * @template T - The type of the parser result.
 */
export const chain =
  <T>(parser: Parser<T>, ...fns: ((value: T) => T)[]): Parser<T> =>
  (input) =>
    parser(input).andThen((value) => Ok(fns.reduce((v, f) => f(v), value)));

/**
 * Takes a `Parser` and a function that maps its output to a new value, and returns a new `Parser` that applies the function to the output of the original parser.
 *
 * @template T - The type of the input to the original parser.
 * @template O - The type of the output of the new parser.
 * @param {Parser<T>} parser - The original `Parser` to apply the mapping function to.
 * @param {(value: T) => Result<O, ParseError>} f - The function to apply to the output of the original `Parser`. It takes the output value as input and returns either a `Result` containing the new output value or a `ParserError`.
 * @returns {Parser<O>} - A new `Parser` that applies the mapping function to the output of the original `Parser`.
 */
export const map =
  <T, O>(
    parser: Parser<T>,
    f: (value: T) => Result<O, ParseError>,
  ): Parser<O> =>
  (input) =>
    parser(input).andThen(f);

/**
 * Reutrns a parser that parses a string or number input and returns a value from an enum based on its key or value.
 *
 * @param en - A TypeScript enum to match the input against.
 * @returns A parser that returns the enum value associated with the input key or value.
 * @template T - An object type representing the enum.
 */
export const enums = <T extends { [key: string]: string | number }>(
  en: T,
): Parser<T[keyof T]> => {
  const values = Object.values(en);
  return (input) =>
    values.includes(input as string)
      ? Ok(input as T[keyof T])
      : Err(typeErr(values.join(" | "), input));
};

/**
 * Takes an array of parsers and returns a new parser that produces the intersection of the results of each parser.
 *
 * @template A - The type of the first parser.
 * @template B - The type of the rest of the parsers.
 * @param { [A, ...B] } structs - The array of parsers to apply the intersection.
 * @returns { Parser<Infer<A> & UnionToIntersection<InferTuple<B>[number]>> } - A new parser that produces the intersection of the results of each parser.
 */
export const intersection =
  <A extends Parser<PlainObject>, B extends Parser<PlainObject>[]>(
    structs: [A, ...B],
  ): Parser<Infer<A> & UnionToIntersection<InferTuple<B>>> =>
  (input) => {
    const obj = Object.create(null);
    for (const struct of structs) {
      const res = struct(input);
      if (res.isErr()) return res;
      Object.assign(obj, res.unwrap());
    }
    return Ok(obj);
  };

/**
 * Takes a constant value and returns a new parser that returns the constant value if the input is equal to the constant value.
 *
 * @template T - The type of the constant value.
 * @param { T } constant - The constant value to compare to the input.
 * @returns { Parser<T> } - A new parser that returns the constant value if the input is equal to the constant value.
 */
export const literal =
  <T extends Literal>(constant: T): Parser<T> =>
  (input) =>
    input === constant ? Ok(constant) : Err(typeErr(String(constant), input));

/**
 * Takes an array of parsers and returns a new parser that produces a tuple with the results of each parser in the array.
 *
 * @template A - The type of the first parser.
 * @template B - The type of the rest of the parsers.
 * @param { [A, ...B] } parsers - The array of parsers to apply to the input.
 * @returns { Parser<[Infer<A>, ...InferTuple<B>]> } - A new parser that produces a tuple with the results of each parser in the array.
 */
export const tuple =
  <A extends Parser, B extends Parser[]>(
    parsers: [A, ...B],
  ): Parser<[Infer<A>, ...InferTuple<B>]> =>
  (input) => {
    if (!isArray(input)) return Err(typeErr("array", input));
    const arr = new Array(parsers.length);
    for (let i = 0; i < parsers.length; i++) {
      const res = parsers[i](input[i]);
      if (res.isErr()) {
        const err = res.unwrapErr();
        err.path.unshift(i.toString());
        return Err(err);
      }
      arr[i] = res.unwrap();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Ok(arr as any);
  };

/**
 * A parser that attempts to match the input with one of several parsers in an ordered list of parsers.
 * The first parser to successfully match the input is used to parse the input.
 *
 * @template A The type of the first parser in the list.
 * @template B The type of the second parser in the list.
 * @template C The type of the remaining parsers in the list.
 * @param {readonly [A, B, ...B]} parsers An ordered list of parsers to attempt to match the input against.
 * @returns {Parser<InferTuple<[A, B, ...C]>>} A parser that returns the value parsed by the first parser to match the input.
 */
export const union =
  <A extends Parser, B extends Parser[]>(
    parsers: [A, ...B],
  ): Parser<InferTuple<[A, ...B]>> =>
  (input) => {
    for (const parser of parsers) {
      const res = parser(input);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (res.isOk()) return res as any;
    }
    return Err(typeErr(parsers.map((s) => s.name).join(" | "), input));
  };

/**
 * A parser that returns the input value as is, without attempting to parse it.
 *
 * @type {Parser<unknown>}
 */
export const unknown: Parser<unknown> = (input) => Ok(input);

export const list = <T>(parser: Parser<T>): Parser<List<T>> =>
  map(array(parser), (value) => Ok(List.from(value)));

/**
 * Returns a `Parser` that parses an email address string.
 * The input string is first trimmed and converted to lowercase before being passed to `isEmail`.
 * If the input string is a valid email address, the parser returns a `Result` containing the email address string.
 * Otherwise, it returns a `ParserError` indicating that the input is not a valid email address.
 *
 * @returns {Parser<string>} - A `Parser` that parses an email address string.
 */
export const email = (): Parser<string> =>
  map(
    chain(string(), (s) => s.trim().toLowerCase()),
    (v) => (isEmail(v) ? Ok(v) : Err(typeErr("email", v))),
  );

export const uuid = (): Parser<string> =>
  map(
    chain(string(), (s) => s.trim().toUpperCase()),
    (v) => (isUUID(v) ? Ok(v) : Err(typeErr("uuid", v))),
  );
