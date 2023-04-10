import { isFunction } from "./guards";
import type { Option } from "./option";
import { None, Some } from "./option";
import { identity, raise } from "./util";

const OkTag = Symbol("Ok");
const ErrTag = Symbol("Err");

type _Ok<T> = { _tag: typeof OkTag; value: T };
type _Err<E> = { _tag: typeof ErrTag; error: E };
type _Result<T, E> = _Ok<T> | _Err<E>;

export class Result<T, E> {
  #res: _Result<T, E>;

  private constructor(res: _Result<T, E>) {
    this.#res = res;
  }

  static Ok<T, E>(value: T): Result<T, E> {
    return new Result({ _tag: OkTag, value });
  }

  static Err<T, E>(error: E): Result<T, E> {
    return new Result({ _tag: ErrTag, error });
  }

  static from<T>(f: () => T): Result<T, unknown> {
    try {
      return Ok(f());
    } catch (err) {
      return Err(err);
    }
  }

  static fromAsync<T>(
    promise: Promise<T> | (() => Promise<T>),
  ): Promise<Result<T, unknown>> {
    if (isFunction(promise)) {
      return Result.fromAsync(promise());
    }
    return promise.then(Ok).catch((err) => Err(err));
  }

  match<O>(onOk: (value: T) => O, onErr: (error: E) => O): O {
    if (this.#res._tag === OkTag) {
      return onOk(this.#res.value);
    }
    return onErr(this.#res.error);
  }

  isOk(): boolean {
    return this.#res._tag === OkTag;
  }

  isOkAnd(f: (value: T) => boolean): boolean {
    return this.match(f, () => false);
  }

  isErr(): boolean {
    return !this.isOk();
  }

  isErrAnd(f: (error: E) => boolean): boolean {
    return this.match(() => false, f);
  }

  ok(): Option<T> {
    return this.match(Some, () => None);
  }

  err(): Option<E> {
    return this.match(() => None, Some);
  }

  map<U>(f: (value: T) => U): Result<U, E> {
    return this.match(
      (value) => Ok(f(value)),
      () => this as unknown as Result<U, E>,
    );
  }

  mapOr<U>(defaultValue: U, f: (value: T) => U): U {
    return this.match(f, () => defaultValue);
  }

  mapOrElse<U>(d: (error: E) => U, f: (value: T) => U): U {
    return this.match(f, d);
  }

  mapErr<F>(f: (error: E) => F): Result<T, F> {
    return this.match(
      () => this as unknown as Result<T, F>,
      (error) => Err(f(error)),
    );
  }

  inspect(f: (value: T) => void): this {
    if (this.isOk()) {
      f(this.unwrap());
    }
    return this;
  }

  inspectErr(f: (error: E) => void): this {
    if (this.isErr()) {
      f(this.unwrapErr());
    }
    return this;
  }

  expect(msg: string): T {
    return this.match(identity, () => raise(msg));
  }

  unwrap(): T {
    return this.match(identity, () =>
      raise("called Result.unwrap on an `Err` value"),
    );
  }

  expectErr(msg: string): E {
    return this.match(() => raise(msg), identity);
  }

  unwrapErr(): E {
    return this.match(
      () => raise("called Result.unwrapErr on an `Ok` value"),
      identity,
    );
  }

  and<U>(res: Result<U, E>): Result<U, E> {
    return this.match(
      () => res,
      () => this as unknown as Result<U, E>,
    );
  }

  andThen<U>(f: (value: T) => Result<U, E>): Result<U, E> {
    return this.match(f, () => this as unknown as Result<U, E>);
  }

  or<F>(res: Result<T, F>): Result<T, F> {
    return this.match(
      () => this as unknown as Result<T, F>,
      () => res,
    );
  }

  orElse<F>(f: (error: E) => Result<T, F>): Result<T, F> {
    return this.match(() => this as unknown as Result<T, F>, f);
  }

  unwrapOr(defaultValue: T): T {
    return this.match(identity, () => defaultValue);
  }

  unwrapOrElse(f: (error: E) => T): T {
    return this.match(identity, f);
  }
}

export const Ok = Result.Ok;
export const Err = Result.Err;
