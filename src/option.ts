import { isPresent } from "./guards";
import type { Result } from "./result";
import { Err, Ok } from "./result";
import type { Maybe } from "./types";
import { identity, raise } from "./util";

const SomeTag = Symbol("Some");
const NoneTag = Symbol("None");

type _Some<T> = { _tag: typeof SomeTag; value: T };
type _None = { _tag: typeof NoneTag };
type _Option<T> = _Some<T> | _None;

export class Option<T> {
  #opt: _Option<T>;

  private constructor(opt: _Option<T>) {
    this.#opt = opt;
  }

  static from<T>(value: Maybe<T>): Option<T> {
    const opt: _Option<T> = isPresent(value)
      ? { _tag: SomeTag, value }
      : { _tag: NoneTag };
    return new Option(opt);
  }

  static Some<T>(value: T): Option<T> {
    return new Option({ _tag: SomeTag, value });
  }

  static None = new Option({ _tag: NoneTag }) as Option<never>;

  match<O>(onSome: (value: T) => O, onNone: () => O): O {
    if (this.#opt._tag === SomeTag) {
      return onSome(this.#opt.value);
    }
    return onNone();
  }

  isSome(): boolean {
    return this.#opt._tag === SomeTag;
  }

  isSomeAnd(f: (value: T) => boolean): boolean {
    return this.match(f, () => false);
  }

  isNone(): boolean {
    return !this.isSome();
  }

  expect(msg: string): T {
    return this.match(identity, () => raise(msg));
  }

  unwrap(): T {
    return this.match(identity, () =>
      raise("called Option.unwrap on a `None` value"),
    );
  }

  unwrapOr(defaultValue: T): T {
    return this.match(identity, () => defaultValue);
  }

  unwrapOrElse(f: () => T): T {
    return this.match(identity, f);
  }

  map<U>(f: (value: T) => U): Option<U> {
    return this.match(
      (value) => Some(f(value)),
      () => this as unknown as Option<U>,
    );
  }

  inspect(f: (value: T) => void): this {
    if (this.isSome()) {
      f(this.unwrap());
    }
    return this;
  }

  mapOr<U>(defaultValue: U, f: (value: T) => U): U {
    return this.match(f, () => defaultValue);
  }

  mapOrElse<U>(d: () => U, f: (value: T) => U): U {
    return this.match(f, d);
  }

  okOr<E>(err: E): Result<T, E> {
    return this.match(
      (value) => Ok(value),
      () => Err(err),
    );
  }

  okOrElse<E>(f: () => E): Result<T, E> {
    return this.match(
      (value) => Ok(value),
      () => Err(f()),
    );
  }

  and<U>(optb: Option<U>): Option<U> {
    return this.match(
      () => optb,
      () => this as unknown as Option<U>,
    );
  }

  andThen<U>(f: (value: T) => Option<U>): Option<U> {
    return this.match(f, () => this as unknown as Option<U>);
  }

  filter(predicate: (value: T) => boolean): Option<T>;
  filter<U extends T>(predicate: (value: T) => value is U): Option<U> {
    if (this.isSome()) {
      const value = this.unwrap();
      if (predicate(value)) {
        return Some(value);
      }
    }
    return this as unknown as Option<U>;
  }

  or(optb: Option<T>): Option<T> {
    return this.match(
      () => this,
      () => optb,
    );
  }

  orElse(f: () => Option<T>): Option<T> {
    return this.match(() => this, f);
  }

  xor(optb: Option<T>): Option<T> {
    if (this.isSome() && optb.isNone()) return this;
    if (this.isNone() && optb.isSome()) return optb;
    return None;
  }

  toJSON() {
    return this.match(identity, () => null);
  }
}

export const Some = Option.Some;
export const None = Option.None;

Object.freeze(None);
