import { Auth } from '@my-app/authz-api';
import {
  WelcomeParams,
  WelcomeResponse,
  AddTestEntityParams,
  AddTestEntityResponse,
  EditTestEntityParams,
  EditTestEntityResponse
} from '@my-app/service-mongo-api';

import { sudoAuth } from '../src/lib/common.utils';
import { broker } from '../src/lib/moleculer/broker';

export async function pingAuth(auth: Auth = sudoAuth): Promise<string> {
  return broker.call('service-mongo.pingAuth', undefined, {
    meta: { auth },
    caller: 'test-suite'
  });
}

export async function welcome(
  data: WelcomeParams,
  auth: Auth = sudoAuth
): Promise<WelcomeResponse> {
  return broker.call('service-mongo.welcome', data, {
    meta: { auth },
    caller: 'test-suite'
  });
}

export async function addTestEntity(
  data: AddTestEntityParams,
  auth: Auth = sudoAuth
): Promise<AddTestEntityResponse> {
  return broker.call('service-mongo.addTestEntity', data, { meta: { auth } });
}

export async function editTestEntity(
  data: EditTestEntityParams,
  auth: Auth = sudoAuth
): Promise<EditTestEntityResponse> {
  return broker.call('service-mongo.editTestEntity', data, { meta: { auth } });
}
