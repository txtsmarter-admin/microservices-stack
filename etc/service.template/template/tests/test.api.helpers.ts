import { Auth } from '@my-app/authz-api';
import { 
  WelcomeParams, 
  WelcomeResponse,
{{#if needDb}}
  AddTestEntityParams, 
  AddTestEntityResponse, 
  EditTestEntityParams,
  EditTestEntityResponse 
{{/if}}
} from '@my-app/{{serviceName}}-api';

import { sudoAuth } from '../src/lib/common.utils';
import { broker } from '../src/lib/moleculer/broker';

export async function pingAuth(auth: Auth = sudoAuth): Promise<string> {
  return broker.call('{{serviceName}}.pingAuth', undefined, {
    meta: { auth },
    caller: 'test-suite'
  });
}

export async function welcome(
  data: WelcomeParams,
  auth: Auth = sudoAuth
): Promise<WelcomeResponse> {
  return broker.call('{{serviceName}}.welcome', data, {
    meta: { auth },
    caller: 'test-suite'
  });
}
{{#if needDb}}

export async function addTestEntity(
  data: AddTestEntityParams,
  auth: Auth = sudoAuth
): Promise<AddTestEntityResponse> {
  return broker.call('{{serviceName}}.addTestEntity', data, { meta: { auth } });
}

export async function editTestEntity(
  data: EditTestEntityParams,
  auth: Auth = sudoAuth
): Promise<EditTestEntityResponse> {
  return broker.call('{{serviceName}}.editTestEntity', data, { meta: { auth } });
}

{{/if}}