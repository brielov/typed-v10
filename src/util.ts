import type { ParseError, Parser } from "./parsing";
import { Result } from "./result";

/**
 * Throws an error with the provided message or the message of the provided error.
 *
 * @param err - Either an error object or a string message.
 * @returns never
 * @throws The provided error message or the message of the provided error.
 */
export const raise = (err: string | Error): never => {
  if (typeof err === "string") {
    err = new Error(err);
  }
  throw err;
};

/**
 * Throws an error with the provided message if the condition is falsy.
 *
 * @param condition - The condition to test.
 * @param msg - The message to use in the error if the condition is falsy. Default: "Assertion failed".
 * @returns asserts condition
 * @throws The provided error message if the condition is falsy.
 */
export const assert = (
  condition: unknown,
  msg = "Assertion failed",
): asserts condition => {
  if (!condition) raise(msg);
};

export const identity = <T>(value: T): T => value;

type JsonParseError = SyntaxError | TypeError | RangeError;

export const parseJson = <T>(
  json: string,
  parser: Parser<T>,
): Result<T, JsonParseError | ParseError> => {
  const result = Result.from(() => JSON.parse(json)) as Result<
    unknown,
    JsonParseError
  >;
  return result.andThen(parser);
};

export enum Type {
  Array = "array",
  BigInt = "bigint",
  Boolean = "boolean",
  Date = "date",
  Error = "error",
  Function = "function",
  Infinity = "infinity",
  Int16Array = "int16array",
  Int32Array = "int32array",
  Int8Array = "int8array",
  Map = "map",
  NaN = "nan",
  Null = "null",
  Number = "number",
  Object = "object",
  Promise = "promise",
  RegExp = "regexp",
  Set = "set",
  String = "string",
  Symbol = "symbol",
  Uint16Array = "uint16array",
  Uint32Array = "uint32array",
  Uint8Array = "uint8array",
  Uint8ClampedArray = "uint8clampedarray",
  Undefined = "undefined",
  WeakMap = "weakmap",
  WeakSet = "weakset",
}

export const getTypeOf = (value: unknown): Type => {
  if (value === null) return Type.Null;

  switch (typeof value) {
    case "bigint":
      return Type.BigInt;
    case "boolean":
      return Type.Boolean;
    case "function":
      return Type.Function;
    case "number": {
      if (isNaN(value)) return Type.NaN;
      if (!Number.isFinite(value)) return Type.Infinity;
      return Type.Number;
    }
    case "string":
      return Type.String;
    case "symbol":
      return Type.Symbol;
    case "undefined":
      return Type.Undefined;
  }

  if (Array.isArray(value)) return Type.Array;
  if (value instanceof Date) return Type.Date;
  if (value instanceof Error) return Type.Error;
  if (value instanceof Map) return Type.Map;
  if (value instanceof Promise) return Type.Promise;
  if (value instanceof RegExp) return Type.RegExp;
  if (value instanceof Set) return Type.Set;
  if (value instanceof WeakMap) return Type.WeakMap;
  if (value instanceof WeakSet) return Type.WeakSet;
  if (value instanceof Int8Array) return Type.Int8Array;
  if (value instanceof Int16Array) return Type.Int16Array;
  if (value instanceof Int32Array) return Type.Int32Array;
  if (value instanceof Uint8Array) return Type.Uint8Array;
  if (value instanceof Uint16Array) return Type.Uint16Array;
  if (value instanceof Uint32Array) return Type.Uint32Array;
  if (value instanceof Uint8ClampedArray) return Type.Uint8ClampedArray;

  return Type.Object;
};
