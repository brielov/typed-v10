/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from "vitest";
import { isUndefined } from "../src/guards";
import { isNone, isOption, isSome } from "../src/option";
import { isErr, isOk, isResult } from "../src/result";

interface CustomMatchers<R = unknown> {
  toBeSome(expected?: unknown): R;
  toBeNone(): R;
  toBeOk(expected?: unknown): R;
  toBeErr(expected?: unknown): R;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Assertion extends CustomMatchers {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}

const unwrap = (value: unknown): unknown => {
  if (isOption(value)) {
    if (isSome(value)) return unwrap(value.value);
    return undefined;
  }

  if (isResult(value)) {
    if (isOk(value)) return unwrap(value.value);
    return unwrap(value.error);
  }

  return value;
};

expect.extend({
  toBeSome(recieved, expected) {
    const pass =
      isOption(recieved) &&
      isSome(recieved) &&
      (isUndefined(expected) ||
        this.equals(unwrap(recieved), unwrap(expected)));

    return {
      pass,
      message: () => `Recieved is${this.isNot ? " not" : ""} some option`,
    };
  },
  toBeNone(recieved) {
    const pass = isOption(recieved) && isNone(recieved);

    return {
      pass,
      message: () => `Recieved is${this.isNot ? " not" : ""} none option`,
    };
  },
  toBeOk(recieved, expected) {
    const pass =
      isResult(recieved) &&
      isOk(recieved) &&
      (isUndefined(expected) ||
        this.equals(unwrap(recieved), unwrap(expected)));

    return {
      pass,
      message: () => `Recieved is${this.isNot ? " not" : ""} ok result`,
    };
  },
  toBeErr(recieved, expected) {
    const pass =
      isResult(recieved) &&
      isErr(recieved) &&
      (isUndefined(expected) || this.equals(recieved.error, expected));

    return {
      pass,
      message: () => `Recieved is${this.isNot ? " not" : ""} err result`,
    };
  },
});
