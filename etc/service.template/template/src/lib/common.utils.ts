/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import {
  Ability,
  subject as createCaslSubject,
  PureAbility
} from '@casl/ability';
import { Errors, CallingOptions } from 'moleculer';
import { inspect } from 'util';
{{#if needDb}}
import { Collection } from '@mikro-orm/core';
{{/if}}
import * as AuthzApi from '@my-app/authz-api';

export const { MoleculerError } = Errors;

const serviceName = '{{serviceName}}';

{{#if needDb}}
type StringOnly<T> = T extends string ? T : never;

// User for entities to omit Collections from constructor
export type CollectionsNames<Base extends object> = StringOnly<
  keyof Pick<
    Base,
    {
      [Key in keyof Base]: Base[Key] extends Collection<any> ? Key : never;
    }[keyof Base]
  >
>;

export function getDbPagination(args: { page: number; pageLength: number }) {
  const { page, pageLength } = args;

  return {
    offset: page * pageLength,
    limit: pageLength
  };
}
{{/if}}
// Keep it for future
// export function pick<T extends object, K extends keyof T>(
//   obj: T,
//   keys: K[]
// ): { [Key in K]: T[Key] };
// export function pick<T extends null | undefined, K extends string>(
//   obj: T,
//   keys: K[]
// ): null;
// export function pick<T extends object | null | undefined, K extends keyof T>(
//   obj: T,
//   keys: K[]
// ): { [Key in K]: T[Key] } | null {
//   if (obj === null || obj === undefined) {
//     return null;
//   }
//   return Object.entries(obj as { [key: string]: any })
//     .filter(([key]) => keys.includes(key as any))
//     .reduce((o, [key, val]) => Object.assign(o, { [key]: val }), {}) as any;
// }

// -----------------------------------------------------
const sudoCaller = `${serviceName.toUpperCase()}-SERVICE`

export const sudoAuth: AuthzApi.Auth = {
  userId: sudoCaller,
  permissions: {
    rules: [{ action: 'manage', subject: 'all' }]
  }
};

export function userCall(ctx: { meta: { auth: AuthzApi.Auth }}) {
  const callOpts: CallingOptions & {
    meta?: AuthzApi.ContextMeta;
  } = {
    caller: serviceName,
    meta: {
      auth: ctx.meta.auth
    }
  };

  return callOpts;
}

export const sudoCall: CallingOptions & {
  meta?: AuthzApi.ContextMeta;
} = {
  caller: sudoCaller,
  meta: {
    auth: sudoAuth
  }
};

export const ANY_VALUE = Symbol('ANY_VALUE');

type Conditions = {
  [K in keyof AuthzApi.RuleCondition]:
    | AuthzApi.RuleCondition[K]
    | undefined
    | typeof ANY_VALUE;
};

type GetAbilityTuples<
  TCustomPureAbility
> = TCustomPureAbility extends PureAbility<infer TCustomAbilities>
  ? TCustomAbilities
  : never;

export function commonAuthorize<T_ABILITY extends PureAbility>(ctx: {
  meta: { auth: AuthzApi.Auth };
}) {
  return {
    throwIfUser() {
      return {
        cannot(...actionAndSubject: GetAbilityTuples<T_ABILITY>) {
          const action = actionAndSubject[0];
          const subject = actionAndSubject[1];
          return {
            where(conditions: Conditions): void {
              const { auth } = ctx.meta || {}; // At this point, we should be authorized

              if (!auth) {
                throw new MoleculerError(`Unauthorized`, 401);
              }

              const ability = new Ability<[any, any]>(
                auth.permissions?.rules as any
              );

              let normalizedConditions: any = {};
              // eslint-disable-next-line no-restricted-syntax
              for (const [key, value] of Object.entries(conditions)) {
                if (value !== undefined && value !== ANY_VALUE) {
                  normalizedConditions[key] = value;
                }
              }
              if (!Object.keys(normalizedConditions).length) {
                normalizedConditions = undefined;
              }

              const subjectWithConditions = createCaslSubject<any, any>(
                subject,
                normalizedConditions
              );

              if (ability.cannot(action, subjectWithConditions as any)) {
                const where = Object.entries(conditions)
                  .map(
                    ([key, value]) =>
                      `${key}=${value === ANY_VALUE ? `*` : `'${value}'`}`
                  )
                  .join('" and "');

                throw new MoleculerError(
                  `User not allowed to "${action}" "${subject}"${
                    where ? ` where ${inspect(where)}` : ``
                  }.`,
                  403
                );
              }
            }
          };
        }
      };
    },
    doesUser<T extends object>() {
      return {
        can(...actionAndSubject: GetAbilityTuples<T_ABILITY>) {
          const action = actionAndSubject[0];
          const subject = actionAndSubject[1];
          return {
            where(conditions: T): boolean {
              const { auth } = ctx.meta || {}; // At this point, we should be authorized

              if (!auth) {
                throw new MoleculerError(`Unauthorized`, 401);
              }

              const ability = new Ability<[any, any]>(
                auth.permissions?.rules as any
              );

              const subjectWithConditions = createCaslSubject<any, T>(
                subject,
                conditions
              );

              return ability.can(action, subjectWithConditions as any);
            }
          };
        }
      };
    }
  };
}
