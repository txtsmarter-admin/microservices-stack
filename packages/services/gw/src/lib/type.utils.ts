/* eslint-disable no-use-before-define */
/**
 * Custom TypeScript utilities
 *
 * Copyright MyCompany 2022. All rights reserved.
 */

// Make all optional preperties required, but allow undefined
export type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>>
    ? T[P]
    : T[P] | undefined;
};

// All properties absolutely required, no undefined allowed
export type CompleteNonNullable<T> = {
  [K in keyof Complete<T>]: NonNullable<T[K]>;
};

// No additional properties allowed
type Impossible<K extends keyof any> = {
  [P in K]: never;
};
export type Exact<T, U extends T> = U & Impossible<Exclude<keyof U, keyof T>>;

// All optional properties are required and no additional allowed
export type RequiredExact<T, U extends Required<T>> = Exact<T, U>;

// npm object.omit seems to not work as expected
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): { [Key in keyof Omit<T, K>]: T[Key] } {
  return Object.entries(obj)
    .filter(([key]) => !keys.includes(key as any))
    .reduce((o, [key, val]) => Object.assign(o, { [key]: val }), {}) as any;
}

/**
 * Useful to wrap resolver return type.
 * It lets you return optional field for any required nullable property.
 *
 * Briefly - allow undefined if type allows null
 */
export type Normalize<
  T,
  ALL_NULL_KEYS extends keyof T = {
    [K in keyof T]: null extends T[K] ? K : never;
  }[keyof T],
  OBJECT_NULL_KEYS extends keyof T = {
    [K in keyof T]: T[K] extends object | null
      ? null extends T[K]
        ? K
        : never
      : never;
  }[keyof T],
  PRIMITIVE_NULL_KEYS extends keyof T = Exclude<ALL_NULL_KEYS, OBJECT_NULL_KEYS>
> = {
  [P in OBJECT_NULL_KEYS]?: Normalize<Exclude<T[P], null>> | null;
} & Partial<Pick<T, PRIMITIVE_NULL_KEYS>> &
  Pick<T, Exclude<keyof T, ALL_NULL_KEYS>>;

// utility to override a type of a member within an encapsulating type
export type Override<T1, T2> = Omit<T1, keyof T2> & T2;

// -----------------------------------------------------
//  Utils to produce exact response type
//

export function exact<S, T>(object: ExactResponse<S, T>) {
  return object;
}

export type ExactResponse<Expected, Actual> = Expected &
  Actual & // Needed to infer `Actual`
  (null extends Actual
    ? null extends Expected
      ? Actual extends null // If only null stop here, because NonNullable<null> = never
        ? null
        : CheckUndefined<Expected, Actual>
      : never // Actual can be null but not Expected: forbid the field
    : CheckUndefined<Expected, Actual>);

type CheckUndefined<Expected, Actual> = undefined extends Actual
  ? undefined extends Expected
    ? Actual extends undefined // If only undefined stop here, because NonNullable<undefined> = never
      ? undefined
      : NonNullableExact<NonNullable<Expected>, NonNullable<Actual>>
    : never // Actual can be undefined but not Expected: forbid the field
  : NonNullableExact<NonNullable<Expected>, NonNullable<Actual>>;

type NonNullableExact<Expected, Actual> = {
  [K in keyof Actual]: K extends keyof Expected
    ? Actual[K] extends (infer ActualElement)[]
      ? Expected[K] extends (infer ExpectedElement)[] | undefined | null
        ? ExactResponse<ExpectedElement, ActualElement>[]
        : never // Not both array
      : ExactResponse<Expected[K], Actual[K]>
    : never; // Forbid extra properties
};
