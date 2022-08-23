/**
 * Middleware for saga pattern
 * Copyright MyCompany 2022. All rights reserved.
 */
import Moleculer, { ActionSchema, Context } from 'moleculer';
import { CustomActionSchema, Saga } from 'typed-moleculer';
import _ from 'lodash';

import { CTX } from '../lib/moleculer/broker';

type CTXWithSaga = CTX & {
  meta: {
    $saga: {
      compensations: ActionSchema[];
    };
  };
};

export function getSagaMiddleware() {
  const SagaMiddleware: Moleculer.Middleware = {
    localAction(
      next: (ctx: Context) => Promise<any>,
      action: ActionSchema & CustomActionSchema
    ) {
      if (action.saga) {
        const opts = action.saga as Saga;
        return function sagaHandler(ctx: CTXWithSaga) {
          return next(ctx)
            .then((res: any) => {
              if (opts.compensation) {
                if (!ctx.meta.$saga) {
                  ctx.meta.$saga = {
                    compensations: []
                  };
                }

                const comp: ActionSchema = {
                  action: opts.compensation.action
                };
                if (opts.compensation.paramKeys) {
                  // construct params object for compensating call
                  comp.params = opts.compensation.paramKeys.reduce((a, b) => {
                    _.set(a, b, _.get(res, b)); // assumes result res has this parameter
                    return a;
                  }, {});
                }
                ctx.meta.$saga.compensations.unshift(comp);
              }
              return res;
            })
            .catch((err: any) => {
              if (
                action.saga === true && // we want this triggered from the high level saga creator not individual saga contributing actions
                ctx.meta.$saga &&
                ctx.meta.$saga.compensations
              ) {
                // Start compensating
                if (ctx.service) {
                  ctx.service.logger.error(
                    'Some error occured. Start compensating...'
                  );
                  ctx.service.logger.info(ctx.meta.$saga.compensations);
                }
                if (
                  ctx.meta.$saga &&
                  Array.isArray(ctx.meta.$saga.compensations)
                ) {
                  return Promise.all(
                    ctx.meta.$saga.compensations.map(comp => {
                      ctx.call(comp.action, comp.params);
                    })
                  ).then(() => {
                    // throw the error because we are here because of a saga rollback/compensation
                    throw err;
                  });
                }
              }

              throw err;
            });
        };
      }

      return next;
    }
  };

  return SagaMiddleware;
}
