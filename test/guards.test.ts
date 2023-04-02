import { describe, expect, it } from "vitest";

import {
  isBigInt,
  isBoolean,
  isDate,
  isFunction,
  isInstanceOf,
  isIterable,
  isNil,
  isNull,
  isNumber,
  isPlainObject,
  isPresent,
  isPrimitive,
  isRegExp,
  isString,
  isSymbol,
  isUndefined,
  isValidDate,
  isValidNumber,
} from "../src/guards";

const DATA_TYPES = {
  array: [],
  bigint: BigInt(10),
  boolean: false,
  date: new Date(),
  function: () => void 0,
  map: new Map(),
  null: null,
  nullobject: Object.create(null),
  number: 10,
  object: {},
  promise: Promise.resolve(0),
  regexp: new RegExp("lorem ipsum"),
  set: new Set(),
  string: "lorem ipsum",
  symbol: Symbol("lorem ipsum"),
  undefined: undefined,
  weakmap: new WeakMap(),
  weakset: new WeakSet(),
};

type DataType = keyof typeof DATA_TYPES;

function t(guard: (value: unknown) => unknown, types: readonly DataType[]) {
  const entries = [...Object.entries(DATA_TYPES)];
  const accepted = entries.filter(([k]) => types.includes(k as DataType));
  const rejected = entries.filter(([k]) => !types.includes(k as DataType));

  describe(`${guard.name}`, () => {
    accepted.forEach(([k, v]) =>
      it(`should return true for data type '${k}'`, () =>
        expect(guard(v)).toBe(true)),
    );

    rejected.forEach(([k, v]) =>
      it(`should return false for data type '${k}'`, () =>
        expect(guard(v)).toBe(false)),
    );
  });
}

describe("isInstanceOf", () => {
  it("should work", () => {
    expect(isInstanceOf(Map, new Map())).toBe(true);
    expect(isInstanceOf(Set, new Set())).toBe(true);
    expect(isInstanceOf(Date, new Date())).toBe(true);
    expect(isInstanceOf(RegExp, new RegExp(""))).toBe(true);
  });
});

t(isString, ["string"]);
t(isNumber, ["number"]);
t(isBoolean, ["boolean"]);
t(isBigInt, ["bigint"]);
t(isSymbol, ["symbol"]);
t(isFunction, ["function"]);
t(isUndefined, ["undefined"]);
t(isNull, ["null"]);
t(isNil, ["null", "undefined"]);
t(isDate, ["date"]);
t(isRegExp, ["regexp"]);
t(isPlainObject, ["object", "nullobject"]);
t(isIterable, ["string", "array", "map", "set"]);

t(isPrimitive, [
  "string",
  "number",
  "boolean",
  "bigint",
  "symbol",
  "null",
  "undefined",
]);

t(
  isPresent,
  Object.keys(DATA_TYPES).filter(
    (k) => k !== "null" && k !== "undefined",
  ) as DataType[],
);

it("should return true for non `NaN` numbers", () => {
  expect(isValidNumber(10)).toBe(true);
  expect(isValidNumber(NaN)).toBe(false);
});

it("should return true for non `Infinity` numbers", () => {
  expect(isValidNumber(10)).toBe(true);
  expect(isValidNumber(Infinity)).toBe(false);
  expect(isValidNumber(-Infinity)).toBe(false);
});

it("should return true for non `Invalid Date` dates", () => {
  expect(isValidDate(new Date())).toBe(true);
  expect(isValidDate(new Date("invalid date"))).toBe(false);
});
