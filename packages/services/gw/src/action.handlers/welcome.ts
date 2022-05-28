/**
 * Implementation of gw.welcome action
 *
 * Copyright MyCompany 2022. All rights reserved.
 */
import { WelcomeParams, WelcomeResponse } from '@my-app/gw-api';

import { CTX } from '../lib/moleculer/broker';
import { authorize } from '../service.utils';
import { exact } from '../lib/type.utils';

/**
 * An action that returns a welcome message
 */
export async function welcome(
  ctx: CTX<WelcomeParams>
): Promise<WelcomeResponse> {
  authorize(ctx)
    .throwIfUser()
    .cannot('welcome', 'gw')
    .where({ clientId: 'client you want to welcome' });

  // Use this syntax to ensure that response do not contains additional properties
  const response = {
    greetings: `Welcome ${ctx.params.name}; caller: ${ctx.caller}!`
  };

  return exact<WelcomeResponse, typeof response>(response);
}
