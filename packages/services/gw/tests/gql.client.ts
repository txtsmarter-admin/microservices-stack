import jwt from 'jsonwebtoken';
import { GraphQLClient, gql } from 'graphql-request';
import { GraphQLError } from 'graphql-request/dist/types';

import {
  MYAPP_ID_TOKEN_COOKIE,
  MyAppIdTokenPayload
} from '../src/graphql/auth/auth.utils';
import { config } from '../src/lib/env';

const idTokenRx = new RegExp(`${MYAPP_ID_TOKEN_COOKIE}=(?<value>[^ ;]*)(; )?`);

export class GqlClient {
  private client: GraphQLClient;

  idToken: string = '';
  bearerToken: string = '';

  constructor(opts: { url: string; idToken?: string; bearerToken?: string }) {
    this.client = new GraphQLClient(opts.url, {
      credentials: 'include',
      mode: 'cors'
    });

    this.idToken = opts.idToken || '';
    this.bearerToken = opts.bearerToken || '';
  }

  async request<TData = any, TInput = any>(
    query: ReturnType<typeof gql>,
    variables?: TInput
  ): Promise<{
    data?: TData;
    extensions?: any;
    status: number;
    errors?: GraphQLError[];
  }> {
    this.client.setHeader('Cookie', `${MYAPP_ID_TOKEN_COOKIE}=${this.idToken}`);
    if (this.bearerToken) {
      this.client.setHeader('Authorization', `Bearer ${this.bearerToken}`);
    }

    const response = await this.client.rawRequest<TData>(query, variables);

    const { headers } = response;

    // cookie parser will not work as 'set-cookie' string from this library is not compatible with http standard.
    const setCookies = headers.get('set-cookie') || '';
    const newToken = setCookies.match(idTokenRx)?.groups?.value;
    if (newToken !== undefined) {
      this.idToken = newToken;
    }

    return response;
  }
}

export { gql };

export const gqlClient = new GqlClient({
  url: `http://localhost:${config.GRAPHQL__SERVER_PORT}/graphql`
});

const tokenPayload: MyAppIdTokenPayload = {
  id: '99999',
  username: '99999',
  firstName: '99999',
  lastName: '99999',
  phoneNumber: '99999'
};

gqlClient.idToken = jwt.sign(tokenPayload, config.AUTH__JWT_KEY);
