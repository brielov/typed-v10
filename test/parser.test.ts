import { describe, expect, it } from "vitest";
import { None, Some } from "../src/option";
import * as P from "../src/parser";
import { Ok } from "../src/result";

describe("string", () => {
  it("should parse valid strings", () => {
    const parser = P.string();
    expect(parser("foo bar")).toBeOk("foo bar");
  });

  it("should coerce input to a string", () => {
    const parser = P.string({ coerce: true });
    expect(parser(123)).toBeOk("123");
  });

  it("should fail when input is not a string", () => {
    const parser = P.string();
    expect(parser(false)).toBeErr();
  });
});

describe("number", () => {
  it("should parse valid numbers", () => {
    const parser = P.number();
    expect(parser(10)).toBeOk(10);
  });

  it("should coerce input to a number", () => {
    const parser = P.number({ coerce: true });
    expect(parser("123")).toBeOk(123);
  });

  it("should fail when input is not a number", () => {
    const parser = P.number();
    expect(parser(false)).toBeErr();
  });

  it("should fail when input is not a valid number", () => {
    const parser = P.number();
    expect(parser(Infinity)).toBeErr();
    expect(parser(NaN)).toBeErr();
  });
});

describe("boolean", () => {
  it("should parse valid booleans", () => {
    const parser = P.boolean();
    expect(parser(true)).toBeOk(true);
    expect(parser(false)).toBeOk(false);
  });

  it("should fail when input is not a boolean", () => {
    const parser = P.boolean();
    expect(parser(10)).toBeErr();
    expect(parser("foo bar")).toBeErr();
  });
});

describe("date", () => {
  const date = new Date();

  it("should parse valid dates", () => {
    const parser = P.date();
    expect(parser(date)).toBeOk(date);
  });

  it("should coerce input to a boolean", () => {
    const parser = P.date({ coerce: true });
    expect(parser(date.toISOString())).toBeOk(date);
    expect(parser(date.getTime())).toBeOk(date);
  });

  it("should fail when input is not a string", () => {
    const parser = P.date();
    expect(parser(date.toISOString())).toBeErr();
  });
});

describe("optional", () => {
  const parser = P.optional(P.string());

  it("should accept nullable input", () => {
    expect(parser(null)).toEqual(Ok(None));
    expect(parser(undefined)).toEqual(Ok(None));
  });

  it("should pass the input down to the wrapped parser when input is not nullish", () => {
    expect(parser(10)).toBeErr();
    expect(parser("foo bar")).toBeOk(Some("foo bar"));
  });
});

describe("defaulted", () => {
  const parser = P.defaulted(P.string(), "foo bar");

  it("should return the default value when input is nullish", () => {
    expect(parser(null)).toBeOk("foo bar");
    expect(parser(undefined)).toBeOk("foo bar");
  });

  it("should pass the input down to the wrapped parser when input is not nullish", () => {
    expect(parser("baz")).toBeOk("baz");
  });
});

describe("array", () => {
  const parser = P.array(P.number());

  it("should fail when input is not an array", () => {
    expect(parser({})).toBeErr();
  });

  it("should faile when one of the items in the array is not of the specified type", () => {
    expect(parser([1, 2, "3"])).toBeErr();
  });

  it("should parse the array with all of its items", () => {
    expect(parser([1, 2, 3])).toBeOk([1, 2, 3]);
  });
});

describe("object", () => {
  const parser = P.object({ a: P.number(), b: P.string() });

  it("should fail when input is not an object", () => {
    expect(parser([])).toBeErr();
  });

  it("should fail when the shape is not correct", () => {
    expect(parser({ a: "foo bar", b: 10 })).toBeErr();
  });

  it("should parse an object and its properties", () => {
    expect(parser({ a: 10, b: "foo bar" })).toBeOk({ a: 10, b: "foo bar" });
  });

  it("should remove unnecessary properties", () => {
    expect(parser({ a: 10, b: "foo bar", c: true })).toBeOk({
      a: 10,
      b: "foo bar",
    });
  });
});

describe("record", () => {
  const parser = P.record(
    P.union([P.literal("john"), P.literal("mary")]),
    P.number(),
  );

  it("should fail when input is not an object", () => {
    expect(parser([])).toBeErr();
  });

  it("should fail when the keys are wrong", () => {
    expect(parser({ abbey: 10 })).toBeErr();
  });

  it("should fail when values are wrong", () => {
    expect(parser({ john: true })).toBeErr();
  });

  it("should parse an object with the specified keys and values", () => {
    expect(parser({ john: 10, mary: 20 })).toBeOk({ john: 10, mary: 20 });
  });
});

describe("chain", () => {
  const parser = P.chain(
    P.string(),
    (s) => s.trim(),
    (s) => s.toLowerCase(),
  );

  it("should fail when parser fails", () => {
    expect(parser(10)).toBeErr();
  });

  it("should apply a list of functions to the result of the parser", () => {
    expect(parser("   FOO BAR   ")).toBeOk("foo bar");
  });
});

describe("enums", () => {
  enum Role {
    Admin,
    User,
    Guest,
  }

  const parser = P.enums(Role);

  it("should fail when input is not an enum member", () => {
    expect(parser("Unknown")).toBeErr();
  });

  it("should parse an enum", () => {
    expect(parser(0)).toBeOk(0);
    expect(parser(Role.Guest)).toBeOk(Role.Guest);
  });
});

describe("intersection", () => {
  const a = P.object({ a: P.number() });
  const b = P.object({ b: P.string() });
  const parser = P.intersection([a, b]);

  it("should fail when an underliying parser fails", () => {
    expect(parser({ a: "foo bar", b: "bar baz" })).toBeErr();
    expect(parser({ a: 10, b: false })).toBeErr();
  });

  it("should parse an object", () => {
    expect(parser({ a: 10, b: "foo bar" })).toBeOk({ a: 10, b: "foo bar" });
  });

  it("should remove unnecessary properties", () => {
    expect(parser({ a: 10, b: "foo bar", c: true })).toBeOk({
      a: 10,
      b: "foo bar",
    });
  });
});

describe("literal", () => {
  const parser = P.literal("foo bar");

  it("should fail if value is not the specified constant", () => {
    expect(parser("foo baz")).toBeErr();
    expect(parser(10)).toBeErr();
  });

  it("should parse a literal", () => {
    expect(parser("foo bar")).toBeOk("foo bar");
  });
});

describe("tuple", () => {
  const parser = P.tuple([P.number(), P.string()]);

  it("should fail when input is not an array", () => {
    expect(parser({})).toBeErr();
  });

  it("should fail when one of its members fail", () => {
    expect(parser(["foo bar", "bar baz"])).toBeErr();
  });

  it("should parse a tuple", () => {
    expect(parser([10, "foo bar"])).toBeOk([10, "foo bar"]);
  });

  it("should remove any extra items in the array", () => {
    expect(parser([10, "foo bar", false, null, undefined])).toBeOk([
      10,
      "foo bar",
    ]);
  });
});

describe("union", () => {
  const parser = P.union([P.string(), P.number()]);

  it("should fail when input is not one of the specified types", () => {
    expect(parser(true)).toBeErr();
  });

  it("should pass when input is one of the specified types", () => {
    expect(parser(10)).toBeOk(10);
    expect(parser("foo bar")).toBeOk("foo bar");
  });
});

describe("unknown", () => {
  const parser = P.unknown;

  it("should always work", () => {
    expect(parser(10)).toBeOk(10);
    expect(parser("foo bar")).toBeOk("foo bar");
    expect(parser(false)).toBeOk(false);
  });
});
