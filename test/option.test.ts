import { describe, expect, it, vi } from "vitest";
import type { Option } from "../src/option";
import * as O from "../src/option";
import { None, Some } from "../src/option";
import { Err } from "../src/result";

const some = (v = 69): Option<number> => Some(v);
const none = (): Option<number> => None;

describe("into", () => {
  it("should return `None` when argument is nullish", () => {
    expect(O.into(null)).toBeNone();
    expect(O.into(undefined)).toBeNone();
  });

  it("should return `Some` when argument is non-nullish", () => {
    expect(O.into(10)).toBeSome(10);
  });
});

describe("match", () => {
  it("should call the `onSome` branch", () => {
    const onSome = vi.fn();
    const onNone = vi.fn();
    O.match(Some(1), onSome, onNone);
    expect(onSome).toHaveBeenCalledOnce();
    expect(onSome).toHaveBeenCalledWith(1);
    expect(onNone).not.toHaveBeenCalled();
  });

  it("should call the `onNone` branch", () => {
    const onSome = vi.fn();
    const onNone = vi.fn();
    O.match(None, onSome, onNone);
    expect(onNone).toHaveBeenCalledOnce();
    expect(onSome).not.toHaveBeenCalled();
  });
});

describe("and", () => {
  it("should return `optb` when `Some`", () => {
    expect(O.and(some(), some(70))).toBeSome(70);
    expect(O.and(some(), none())).toBeNone();
    expect(O.and(none(), some())).toBeNone();
  });
});

describe("andThen", () => {
  it("should return the result of `f` function call", () => {
    const f = () => some(70);
    expect(O.andThen(some(), f)).toBeSome(70);
    expect(O.andThen(none(), f)).toBeNone();
    expect(O.andThen(some(), () => None)).toBeNone();
  });
});

describe("expect", () => {
  it("should throw when value is `None`", () => {
    expect(() => O.expect(none(), "foo bar")).toThrow("foo bar");
    expect(() => O.expect(some(), "foo bar")).not.toThrow();
    expect(O.expect(some(), "foo bar")).toEqual(69);
  });
});

describe("filter", () => {
  it("should return `None` if predicate returns false", () => {
    expect(O.filter(some(), (v) => v === 70)).toBeNone();
    expect(O.filter(None, (v) => v === 70)).toBeNone();
  });

  it("should return `Some` if predicate returns true", () => {
    expect(O.filter(some(), (v) => v === 69)).toBeSome(69);
  });
});

describe("isSomeAnd", () => {
  it("should return true if value is `Some` and predicate returns true", () => {
    expect(O.isSomeAnd(some(), (v) => v < 70)).toBe(true);
    expect(O.isSomeAnd(some(), (v) => v > 69)).toBe(false);
    expect(O.isSomeAnd(none(), (v) => v === 69)).toBe(false);
  });
});

describe("map", () => {
  it("should return the result of `f` function call when `Some`", () => {
    expect(O.map(some(), (v) => v + 1)).toBeSome(70);
    expect(O.map(none(), (v) => v * 2)).toBeNone();
  });
});

describe("mapOr", () => {
  it("should return default value when `None`", () => {
    expect(O.mapOr(none(), 0, () => 69)).toEqual(0);
  });

  it("should return the result of `f` function call when `Some`", () => {
    expect(O.mapOr(some(), 0, (v) => v + 1)).toEqual(70);
  });
});

describe("mapOrElse", () => {
  it("should return the result of `def` function call when `None`", () => {
    expect(
      O.mapOrElse(
        none(),
        () => 0,
        () => 1,
      ),
    ).toEqual(0);
  });

  it("should return the result of `f` function call when `Some`", () => {
    expect(
      O.mapOrElse(
        some(),
        () => 0,
        (v) => v + 1,
      ),
    ).toEqual(70);
  });
});

describe("okOr", () => {
  it("should return `Ok` when value is `Some`", () => {
    expect(O.okOr(some(), Err("foo bar"))).toBeOk(69);
  });

  it("should return `Err` when value is `None`", () => {
    expect(O.okOr(none(), "foo bar")).toBeErr("foo bar");
  });
});

describe("okOrElse", () => {
  it("should return `Ok` when value is `Some`", () => {
    expect(O.okOrElse(some(), () => "foo bar")).toBeOk(69);
  });

  it("should return `Err` when value is `None`", () => {
    expect(O.okOrElse(none(), () => "foo bar")).toBeErr("foo bar");
  });
});

describe("or", () => {
  it("should return `optb` when value is `None`", () => {
    expect(O.or(none(), some(70))).toBeSome(70);
  });

  it("should return `opt` when value is `Some`", () => {
    expect(O.or(some(), some(70))).toBeSome(69);
  });
});

describe("orElse", () => {
  it("should return the result of `f` function call when value is `None`", () => {
    expect(O.orElse(none(), () => some(70))).toBeSome(70);
  });

  it("should return `opt` when value is `Some`", () => {
    expect(O.orElse(some(), () => some(70))).toBeSome(69);
  });
});

describe("unwrap", () => {
  it("should throw when value is `None`", () => {
    expect(() => O.unwrap(none())).toThrow();
  });

  it("should return the wrapped value", () => {
    expect(O.unwrap(some())).toEqual(69);
  });
});

describe("unwrapOr", () => {
  it("should return `def` when value is `None`", () => {
    expect(O.unwrapOr(none(), 0)).toEqual(0);
  });

  it("should return wrapped value when value is `Some`", () => {
    expect(O.unwrapOr(some(), 0)).toEqual(69);
  });
});

describe("unwrapOrElse", () => {
  it("should return the result of `def` function call when value is `None`", () => {
    expect(O.unwrapOrElse(none(), () => 0)).toEqual(0);
  });

  it("should return the wrapped value when value is `Some`", () => {
    expect(O.unwrapOrElse(some(), () => 0)).toEqual(69);
  });
});

describe("toJSON", () => {
  it("should be JSON serializable", () => {
    expect(JSON.stringify(Some(10))).toEqual("10");
    expect(JSON.stringify(None)).toEqual("null");
  });
});
