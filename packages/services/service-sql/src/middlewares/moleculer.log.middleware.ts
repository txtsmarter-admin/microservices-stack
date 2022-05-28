/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import Moleculer, { Context, ActionSchema } from 'moleculer';
import { CustomActionSchema, LogCallMask } from 'typed-moleculer';
import { get, set } from 'lodash';

const isObject = (o: any) =>
  o !== null && typeof o === 'object' && !(o instanceof String);

const deepMask = (obj: any) => {
  Object.keys(obj).forEach(objField => {
    const value = obj[objField];
    if (isObject(value)) {
      deepMask(value);
    } else if (value) {
      set(obj, objField, '****');
    }
  });
};

const maskJSONFields = (obj: unknown, fields: string[]) => {
  let maskedObj = {};
  try {
    maskedObj = JSON.parse(JSON.stringify(obj));
  } catch (ex) {
    /* istanbul ignore next */
    return obj;
  }

  fields.forEach(field => {
    if (field.includes('[*].')) {
      const [arrayFieldName, subField] = field.split('[*].');
      const arrayValue: any[] = get(maskedObj, arrayFieldName);
      arrayValue.forEach(arrayElement => {
        const value = arrayElement[subField];
        if (value) {
          set(arrayElement, subField, '****');
        }
      });
    } else if (field.includes('.*')) {
      const subField = field.split('.*')[0];
      let innerObject: any;
      if (!subField) {
        innerObject = maskedObj;
      } else {
        innerObject = get(maskedObj, subField);
      }
      deepMask(innerObject);
    } else {
      const value = get(maskedObj, field);
      if (value) {
        set(maskedObj, field, '****');
      }
    }
  });
  return maskedObj;
};

export function getLogMiddleware(logFunction: (...args: any[]) => any) {
  const LogMiddleware: Moleculer.Middleware = {
    localAction(
      next: (ctx: Context) => any,
      action: ActionSchema & CustomActionSchema
    ) {
      return function logAction(ctx: Context) {
        // if we don't have any parameters, just call next
        if (!ctx.params || Object.keys(ctx.params as object).length === 0) {
          return next(ctx);
        }

        // log the call only if the action allows it
        if (action.logCall === true || isObject(action.logCall)) {
          // check if we need to mask anything
          let payloadString: string = JSON.stringify(ctx.params);
          if (isObject(action.logCall)) {
            const logCallMask = action.logCall as LogCallMask;
            if (logCallMask.mask === true) {
              // mask everything
              payloadString = JSON.stringify(
                maskJSONFields(ctx.params, ['.*'])
              );
            } else if (Array.isArray(logCallMask.mask)) {
              payloadString = JSON.stringify(
                maskJSONFields(ctx.params, logCallMask.mask)
              );
            }
          }

          logFunction(
            `Action: '${(ctx.action as ActionSchema).name}'. Caller: '${
              ctx.caller
            }'. Payload: ${payloadString}`
          );
        }

        // return handler
        return next(ctx);
      };
    }
  };

  return LogMiddleware;
}
