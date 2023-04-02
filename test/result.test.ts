import { describe, expect, it, vi } from "vitest";
import { raise } from "../src";
import type { Result } from "../src/result";
import * as R from "../src/result";
import { Err, Ok } from "../src/result";

const ok = (v = 69): Result<number, string> => Ok(v);
const err = (v = "foo bar"): Result<number, string> => Err(v);

describe("match", () => {
  it("should call the `onOk` branch when value is `Ok`", () => {
    const onOk = vi.fn();
    const onErr = vi.fn();
    R.match(ok(), onOk, onErr);
    expect(onOk).toHaveBeenCalledOnce();
    expect(onOk).toHaveBeenCalledWith(69);
  });

  it("should call the `onErr` branch when value is `Err`", () => {
    const onOk = vi.fn();
    const onErr = vi.fn();
    R.match(err(), onOk, onErr);
    expect(onOk).not.toHaveBeenCalledOnce();
    expect(onErr).toHaveBeenCalledOnce();
    expect(onErr).toHaveBeenCalledWith("foo bar");
  });
});

describe("isOkAnd", () => {
  it("should return true when value is `Ok` and `f` returns true", () => {
    expect(R.isOkAnd(ok(), () => true)).toBe(true);
    expect(R.isOkAnd(ok(), () => false)).toBe(false);
    expect(R.isOkAnd(err(), () => true)).toBe(false);
  });
});

describe("isErrAnd", () => {
  it("should return true when value is `Err` and `f` returns true", () => {
    expect(R.isErrAnd(err(), () => true)).toBe(true);
    expect(R.isErrAnd(err(), () => false)).toBe(false);
    expect(R.isErrAnd(ok(), () => true)).toBe(false);
  });
});

describe("and", () => {
  it("should return `r2` when value is `Ok`", () => {
    expect(R.and(ok(), ok(70))).toBeOk(70);
    expect(R.and(err(), ok())).toBeErr();
  });
});

describe("andThen", () => {
  it("should return the result of `f` when value is `Ok`", () => {
    expect(R.andThen(ok(), () => ok(70))).toBeOk(70);
    expect(R.andThen(err(), () => ok())).toBeErr();
  });
});

describe("expect", () => {
  it("should throw when value is `Err`", () => {
    expect(() => R.expect(err(), "foo bar")).toThrow("foo bar");
  });

  it("should return the wrapped value when `Ok`", () => {
    expect(R.expect(ok(), "foo bar")).toEqual(69);
  });
});

describe("expectErr", () => {
  it("should throw when value is `Ok`", () => {
    expect(() => R.expectErr(ok(), "foo bar")).toThrow("foo bar");
  });

  it("should return the wrapped value when `Err`", () => {
    expect(R.expectErr(err(), "foo bar baz")).toEqual("foo bar");
  });
});

describe("map", () => {
  it("should return the result of `f` call when value is `Ok`", () => {
    expect(R.map(ok(), (v) => v + 1)).toBeOk(70);
    expect(R.map(err(), (v) => v + 1)).toBeErr();
  });
});

describe("mapErr", () => {
  it("should return the result of `f` call when value is `Ok`", () => {
    expect(R.mapErr(err(), (v) => v + " baz")).toBeErr("foo bar baz");
    expect(R.mapErr(ok(), (v) => v + " baz")).toBeOk(69);
  });
});

describe("mapOr", () => {
  it("should return `def` when value is `Err`", () => {
    expect(R.mapOr(err(), 0, (v) => v + 1)).toEqual(0);
  });

  it("should return the result of `f` function call when value is `Ok`", () => {
    expect(R.mapOr(ok(), 0, (v) => v + 1)).toEqual(70);
  });
});

describe("mapOrElse", () => {
  it("should return `def` when value is `Err`", () => {
    expect(
      R.mapOrElse(
        err(),
        () => 0,
        (v) => v + 1,
      ),
    ).toEqual(0);
  });

  it("should return the result of `f` function call when value is `Ok`", () => {
    expect(
      R.mapOrElse(
        ok(),
        () => 0,
        (v) => v + 1,
      ),
    ).toEqual(70);
  });
});

describe("or", () => {
  it("should return `r2` when value is `Err`", () => {
    expect(R.or(err(), ok(70))).toBeOk(70);
  });

  it("should return `r1` when value is `Ok`", () => {
    expect(R.or(ok(), ok(70))).toBeOk(69);
  });
});

describe("orElse", () => {
  it("should return the result of `f` function call when value is `Err`", () => {
    expect(R.orElse(err(), () => Ok(70))).toBeOk(70);
  });

  it("should return `res` when value is `Ok`", () => {
    expect(R.orElse(ok(), () => Ok(70))).toBeOk(69);
  });
});

describe("unwrap", () => {
  it("should throw when value is `Err`", () => {
    expect(() => R.unwrap(err())).toThrow();
  });

  it("should return the wrapped value", () => {
    expect(R.unwrap(ok())).toEqual(69);
  });
});

describe("unwrapOr", () => {
  it("should return `def` when value is `Err`", () => {
    expect(R.unwrapOr(err(), 0)).toEqual(0);
    expect(R.unwrapOr(ok(), 0)).toEqual(69);
  });
});

describe("unwrapOrElse", () => {
  it("should return the result of `def` function call when value is `Err`", () => {
    expect(R.unwrapOrElse(err(), () => 0)).toEqual(0);
    expect(R.unwrapOrElse(ok(), () => 0)).toEqual(69);
  });
});

describe("ok", () => {
  it("should return `Some` when value is `Ok`", () => {
    expect(R.ok(ok())).toBeSome(69);
  });

  it("should return `None` when value is `Err`", () => {
    expect(R.ok(err())).toBeNone();
  });
});

describe("into", () => {
  it("should return `Ok` when `fn` does not throw", () => {
    expect(R.into(() => 10)).toBeOk(10);
  });

  it("should return `Err` when `fn` throws", () => {
    expect(R.into(() => raise("foo bar"))).toBeErr();
  });
});

describe("intoAsync", () => {
  it("should handle promises", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await expect(R.intoAsync(Promise.resolve(69))).resolves.toBeOk(69);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await expect(R.intoAsync(Promise.reject("foo bar"))).resolves.toBeErr(
      "foo bar",
    );
  });

  it("should handle async functions", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await expect(R.intoAsync(() => Promise.resolve(69))).resolves.toBeOk(69);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await expect(R.intoAsync(() => Promise.reject("foo bar"))).resolves.toBeErr(
      "foo bar",
    );
  });
});
