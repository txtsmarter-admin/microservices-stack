import { Field, InputType, Int } from 'type-graphql';
import { DeepPartial } from 'utility-types';

// TODO
// replace all GQL 'Pagination-like' duplicates with below Pagination class

@InputType()
export class Pagination {
  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  pageLength!: number;
}

// ==================================================================
//  Helpers
//

/**
 * Handle union of service Params in GraphQL payload.
 * Your GQL payload call can `implements UnionPayload<ServiceParams>`.
 *
 * `<TUnion>` optional properties should be also nullable
 */
export type UnionPayload<TUnion> = DeepNullable<
  DeepPartial<UnionToIntersection<TUnion>>
>;

declare type DeepNullable<T> = T extends Function
  ? T
  : T extends Array<infer U>
  ? DeepNullableArray<U>
  : T extends object
  ? DeepNullableObject<T>
  : T | null;

interface DeepNullableArray<T> extends Array<DeepNullable<T>> {}

declare type DeepNullableObject<T> = {
  [P in keyof T]?: DeepNullable<T[P]>;
};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

// ------------------------------------
