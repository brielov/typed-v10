import { describe, expect, it } from "vitest";
import * as A from "../src/array";

describe("append", () => {
  it("should append an item to the array", () => {
    expect(A.append([1, 2, 3], 4)).toEqual([1, 2, 3, 4]);
  });

  it("should append multiple items to the array", () => {
    expect(A.append([1, 2, 3], 4, 5)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("at", () => {
  it("should return an optional", () => {
    expect(A.at([1, 2, 3], 5)).toBeNone();
    expect(A.at([1, 2, 3], 1)).toBeSome(2);
  });
});

describe("compact", () => {
  it("should remove null and undefined from array", () => {
    expect(A.compact([1, 2, null, 3, undefined])).toEqual([1, 2, 3]);
  });
});

describe("drop", () => {
  it("should skip the first `n` items", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(A.drop(arr, 5)).toEqual([6, 7, 8, 9, 10]);
  });
});

describe("find", () => {
  it("should return an optional", () => {
    const arr = ["john", "mary", "susan"];
    expect(A.find(arr, (n) => n === "jack")).toBeNone();
    expect(A.find(arr, (n) => n === "susan")).toBeSome("susan");
  });
});

describe("first", () => {
  it("should return an optional", () => {
    expect(A.first([])).toBeNone();
    expect(A.first([1, 2, 3])).toBeSome(1);
  });
});

describe("group", () => {
  it("should group by whatever the cb function returns", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const fn = (n: number) => (n % 2 === 0 ? "even" : "odd");
    expect(A.group(arr, fn)).toEqual({
      even: [2, 4, 6, 8, 10],
      odd: [1, 3, 5, 7, 9],
    });
  });
});

describe("groupBy", () => {
  it("should group by object key", () => {
    const arr = [
      { id: 1, role: "admin" },
      { id: 2, role: "admin" },
      { id: 3, role: "user" },
    ];
    expect(A.groupBy(arr, "role")).toEqual({
      admin: [
        { id: 1, role: "admin" },
        { id: 2, role: "admin" },
      ],
      user: [{ id: 3, role: "user" }],
    });
  });
});

describe("insert", () => {
  it("should insert an item at a given index", () => {
    expect(A.insert([1, 2, 3], 4, 1)).toEqual([1, 4, 2, 3]);
  });

  it("should accept negative index", () => {
    expect(A.insert([1, 2, 3], 4, -2)).toEqual([1, 4, 2, 3]);
  });
});

describe("into", () => {
  it("should convert an iterable into an array", () => {
    const obj = { a: "b", c: "d" };

    function* count(n: number) {
      let i = 0;
      while (i < n) {
        yield i++;
      }
    }

    expect(A.into(Object.keys(obj))).toEqual(["a", "c"]);
    expect(A.into(count(5))).toEqual([0, 1, 2, 3, 4]);
    expect(A.into("abc")).toEqual(["a", "b", "c"]);
  });

  it("should accept nullish value and return an empty array", () => {
    expect(A.into()).toEqual([]);
    expect(A.into(null)).toEqual([]);
  });
});

describe("last", () => {
  it("should return an optional", () => {
    expect(A.last([1, 2, 3])).toBeSome(3);
    expect(A.last([])).toBeNone();
  });
});

describe("move", () => {
  it("should move a value from one index to another", () => {
    expect(A.move([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
  });

  it("should accept negative index", () => {
    expect(A.move([1, 2, 3], 1, -1)).toEqual([1, 3, 2]);
  });
});

describe("prepend", () => {
  it("should prepend an item to the array", () => {
    expect(A.prepend([1, 2, 3], 0)).toEqual([0, 1, 2, 3]);
  });

  it("should prepend multiple items to the array", () => {
    expect(A.prepend([3, 4, 5], 1, 2)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("remove", () => {
  it("should remove an item by index", () => {
    expect(A.remove([1, 2, 3], 1)).toEqual([1, 3]);
  });

  it("should accept negative index", () => {
    expect(A.remove([1, 2, 3], -1)).toEqual([1, 2]);
  });
});

describe("reverse", () => {
  it("should reverse the array immutably", () => {
    const arr = [1, 2, 3];
    const reversed = A.reverse(arr);
    expect(reversed).toEqual([3, 2, 1]);
    expect(reversed).not.toBe(arr);
  });
});

describe("shuffle", () => {
  it("not sure how to test this", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = A.shuffle(arr);
    expect(shuffled).not.toEqual(arr);
  });
});

describe("sort", () => {
  it("should sort the array", () => {
    expect(A.sort([3, 2, 1])).toEqual([1, 2, 3]);
  });

  it("should accept a sorting function", () => {
    const f = (a: number, b: number) => b - a;
    expect(A.sort([1, 2, 3], f)).toEqual([3, 2, 1]);
  });
});

describe("swap", () => {
  it("should swap two values by index", () => {
    expect(A.swap([1, 2, 3, 4, 5], 1, 3)).toEqual([1, 4, 3, 2, 5]);
  });
});

describe("take", () => {
  it("should drop every item after `n`", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(A.take(arr, 5)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("uniq", () => {
  it("should remove duplicates", () => {
    expect(A.uniq([1, 1, 1, 2, 2, 3, 3])).toEqual([1, 2, 3]);
  });
});

describe("chunk", () => {
  it("should create smaller chunks based on size", () => {
    const arr = [1, 2, 3, 4, 5, 6];
    expect(A.chunk(arr, 2)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });
});

describe("difference", () => {
  it("should return the difference between two arrays", () => {
    const a = [1, 2, 3];
    const b = [3, 4, 5];
    expect(A.difference(a, b)).toEqual([1, 2]);
  });
});

describe("union", () => {
  it("should merge two or more arrays by using uniq items", () => {
    const arrs = [
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
    ];
    expect(A.union(...arrs)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("zip", () => {
  it("should merge two or more arrays by using each index", () => {
    const arrs = [
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
    ];
    expect(A.zip(...arrs)).toEqual([
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
    ]);
  });
});

describe("takeWhile", () => {
  it("should create a new array while condition is true", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const fn = (n: number) => n <= 5;
    expect(A.takeWhile(arr, fn)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("dropWhile", () => {
  it("should create a new array by skipping items while condition is true", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const fn = (n: number) => n < 5;
    expect(A.dropWhile(arr, fn)).toEqual([5, 6, 7, 8, 9]);
  });
});

describe("without", () => {
  it("should exclude items from the array", () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const excl = [4, 7, 9];
    expect(A.without(arr, ...excl)).toEqual([1, 2, 3, 5, 6, 8]);
  });
});

describe("findIndex", () => {
  it("should return an optional number", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(A.findIndex(arr, (n) => n === 9)).toBeNone();
    expect(A.findIndex(arr, (n) => n === 3)).toBeSome(2);
  });
});
