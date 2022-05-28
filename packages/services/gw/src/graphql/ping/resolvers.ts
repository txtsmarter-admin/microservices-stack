/**
 * Ping resolver.
 *
 */

/* eslint-disable class-methods-use-this */
import {
  Arg,
  Authorized,
  Ctx,
  Query,
  Resolver,
  InputType,
  Field,
  ObjectType
} from 'type-graphql';

import { ResolverContext, ResolverContextNoAuth } from '../interfaces';

@InputType({ description: 'Ping Query' })
class PingQuery {
  @Field()
  message!: string;
}

@ObjectType({ description: 'Ping Response' })
class PingResponse {
  @Field(() => String)
  message!: string;
}

export const tests = {
  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
  testCtx(ctx: ResolverContext | ResolverContextNoAuth) {}
};

@Resolver()
export class PingResolver {
  @Query(() => String)
  async Ping(@Ctx() ctx: ResolverContextNoAuth): Promise<String> {
    tests.testCtx(ctx);
    return 'Greetings from gw!';
  }

  @Authorized()
  @Query(() => PingResponse)
  async PingAuthQuery(
    @Arg('query') query: PingQuery,
    @Ctx() ctx: ResolverContext
  ): Promise<PingResponse> {
    tests.testCtx(ctx);
    return { message: query.message };
  }

  @Query(() => PingResponse)
  async PingNoAuthQuery(
    @Arg('query') query: PingQuery,
    @Ctx() ctx: ResolverContextNoAuth
  ): Promise<PingResponse> {
    tests.testCtx(ctx);
    return { message: query.message };
  }
}
