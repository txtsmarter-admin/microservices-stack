import { Auth } from '@my-app/authz-api';
import { WelcomeParams, WelcomeResponse } from '@my-app/gw-api';

import { sudoAuth } from '../src/lib/common.utils';
import { broker } from '../src/lib/moleculer/broker';

export async function pingAuth(auth: Auth = sudoAuth): Promise<string> {
  return broker.call('gw.pingAuth', undefined, {
    meta: { auth },
    caller: 'test-suite'
  });
}

export async function welcome(
  data: WelcomeParams,
  auth: Auth = sudoAuth
): Promise<WelcomeResponse> {
  return broker.call('gw.welcome', data, {
    meta: { auth },
    caller: 'test-suite'
  });
}
