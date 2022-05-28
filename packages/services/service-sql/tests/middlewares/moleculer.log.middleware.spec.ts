/**
 * Copyright MyCompany 2022. All rights reserved.
 */
import Moleculer from 'moleculer';
import { ActionOptions, CustomActionSchema } from 'typed-moleculer';

import { getLogMiddleware } from '../../src/middlewares/moleculer.log.middleware';

afterEach(() => {
  jest.clearAllMocks();
});

test('Log action middleware: basic', async () => {
  const log = jest.fn((msg: string) => msg);
  const next = jest.fn((ctx: Moleculer.Context) => ctx);
  const actionLogCallTrue: ActionOptions & CustomActionSchema = {
    logCall: true
  };
  const actionLogCallFalse = {};
  const ctx = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: 'value' }
  };

  const mw = getLogMiddleware(log);

  expect(log).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledTimes(0);

  // call an action that does not log it's call, no logging of call should happen
  (mw as any).localAction(next, actionLogCallFalse)(ctx);
  expect(log).toHaveBeenCalledTimes(0);

  // call an action that does log it's call, logging of call should happen
  (mw as any).localAction(next, actionLogCallTrue)(ctx);
  expect(log).toHaveBeenCalledTimes(1);
  expect(log).toHaveBeenCalledWith(
    `Action: '${(ctx.action as any).name}'. Caller: '${
      ctx.caller
    }'. Payload: {"key":"value"}`
  );

  expect(next).toHaveBeenCalledTimes(2);
  expect(next).toHaveBeenCalledWith(ctx);
});

test('Log action middleware: simple mask', async () => {
  const log = jest.fn((msg: string) => msg);
  const next = jest.fn((ctx: Moleculer.Context) => ctx);
  const actionLogCallTrue: ActionOptions & CustomActionSchema = {
    logCall: { mask: ['password'] }
  };
  const ctx = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: 'value', password: 'boo' }
  };

  const mw = getLogMiddleware(log);

  expect(log).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledTimes(0);

  (mw as any).localAction(next, actionLogCallTrue)(ctx);
  expect(log).toHaveBeenCalledTimes(1);
  expect(log).toHaveBeenCalledWith(
    `Action: '${(ctx.action as any).name}'. Caller: '${
      ctx.caller
    }'. Payload: {"key":"value","password":"****"}`
  );

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(ctx);
});

test('Log action middleware: deep mask', async () => {
  const log = jest.fn((msg: string) => msg);
  const next = jest.fn((ctx: Moleculer.Context) => ctx);
  const actionLogCallTrue: ActionOptions & CustomActionSchema = {
    logCall: { mask: ['auth.password'] }
  };
  const ctx = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: 'value', auth: { user: 'foo', password: 'bar' } }
  };

  const mw = getLogMiddleware(log);

  expect(log).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledTimes(0);

  (mw as any).localAction(next, actionLogCallTrue)(ctx);
  expect(log).toHaveBeenCalledTimes(1);
  expect(log).toHaveBeenCalledWith(
    `Action: '${(ctx.action as any).name}'. Caller: '${
      ctx.caller
    }'. Payload: {"key":"value","auth":{"user":"foo","password":"****"}}`
  );

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(ctx);
});

test('Log action middleware: deep wildcard mask', async () => {
  const log = jest.fn((msg: string) => msg);
  const next = jest.fn((ctx: Moleculer.Context) => ctx);
  const actionLogCallTrue: ActionOptions & CustomActionSchema = {
    logCall: { mask: ['auth.*'] }
  };
  const ctx = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: 'value', auth: { user: 'foo', password: 'bar' } }
  };

  const mw = getLogMiddleware(log);

  expect(log).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledTimes(0);

  (mw as any).localAction(next, actionLogCallTrue)(ctx);
  expect(log).toHaveBeenCalledTimes(1);
  expect(log).toHaveBeenCalledWith(
    `Action: '${(ctx.action as any).name}'. Caller: '${
      ctx.caller
    }'. Payload: {"key":"value","auth":{"user":"****","password":"****"}}`
  );

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(ctx);
});

test('Log action middleware: array mask', async () => {
  const log = jest.fn((msg: string) => msg);
  const next = jest.fn((ctx: Moleculer.Context) => ctx);
  const actionLogCallTrue: ActionOptions & CustomActionSchema = {
    logCall: { mask: ['users[*].password'] }
  };
  const ctx = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: 'value', users: [{ user: 'foo', password: 'bar' }] }
  };

  const mw = getLogMiddleware(log);

  expect(log).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledTimes(0);

  (mw as any).localAction(next, actionLogCallTrue)(ctx);
  expect(log).toHaveBeenCalledTimes(1);
  expect(log).toHaveBeenCalledWith(
    `Action: '${(ctx.action as any).name}'. Caller: '${
      ctx.caller
    }'. Payload: {"key":"value","users":[{"user":"foo","password":"****"}]}`
  );

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(ctx);
});

test('Log action middleware: array mask with null', async () => {
  const log = jest.fn((msg: string) => msg);
  const next = jest.fn((ctx: Moleculer.Context) => ctx);
  const actionLogCallTrue: ActionOptions & CustomActionSchema = {
    logCall: { mask: ['users[*].password'] }
  };
  const ctx = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: 'value', users: [{ user: 'foo', password: null }] }
  };

  const mw = getLogMiddleware(log);

  expect(log).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledTimes(0);

  (mw as any).localAction(next, actionLogCallTrue)(ctx);
  expect(log).toHaveBeenCalledTimes(1);
  expect(log).toHaveBeenCalledWith(
    `Action: '${(ctx.action as any).name}'. Caller: '${
      ctx.caller
    }'. Payload: {"key":"value","users":[{"user":"foo","password":null}]}`
  );

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(ctx);
});

test('Log action middleware: null mask', async () => {
  const log = jest.fn((msg: string) => msg);
  const next = jest.fn((ctx: Moleculer.Context) => ctx);
  const actionLogCallTrue: ActionOptions & CustomActionSchema = {
    logCall: { mask: true }
  };
  const ctx = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: null, users: [{ user: 'foo', password: null }] }
  };

  const mw = getLogMiddleware(log);

  expect(log).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledTimes(0);

  (mw as any).localAction(next, actionLogCallTrue)(ctx);
  expect(log).toHaveBeenCalledTimes(1);
  expect(log).toHaveBeenCalledWith(
    `Action: '${(ctx.action as any).name}'. Caller: '${
      ctx.caller
    }'. Payload: {"key":null,"users":[{"user":"****","password":null}]}`
  );

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(ctx);
});

test('Log action middleware: specific null mask', async () => {
  const log = jest.fn((msg: string) => msg);
  const next = jest.fn((ctx: Moleculer.Context) => ctx);
  const actionLogCallTrue: ActionOptions & CustomActionSchema = {
    logCall: { mask: ['password'] }
  };
  const ctx = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: 'value', users: [{ user: 'foo', password: null }] }
  };

  const mw = getLogMiddleware(log);

  expect(log).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledTimes(0);

  (mw as any).localAction(next, actionLogCallTrue)(ctx);
  expect(log).toHaveBeenCalledTimes(1);
  expect(log).toHaveBeenCalledWith(
    `Action: '${(ctx.action as any).name}'. Caller: '${
      ctx.caller
    }'. Payload: {"key":"value","users":[{"user":"foo","password":null}]}`
  );

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(ctx);
});

test('Log action middleware: mask all', async () => {
  const log = jest.fn((msg: string) => msg);
  const next = jest.fn((ctx: Moleculer.Context) => ctx);
  const actionLogCallTrue: ActionOptions & CustomActionSchema = {
    logCall: { mask: true }
  };
  const ctx = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: 'value', auth: { user: 'foo', password: 'bar' } }
  };

  const mw = getLogMiddleware(log);

  expect(log).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledTimes(0);

  (mw as any).localAction(next, actionLogCallTrue)(ctx);
  expect(log).toHaveBeenCalledTimes(1);
  expect(log).toHaveBeenCalledWith(
    `Action: '${(ctx.action as any).name}'. Caller: '${
      ctx.caller
    }'. Payload: {"key":"****","auth":{"user":"****","password":"****"}}`
  );

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(ctx);
});

test('Log action middleware: illegal mask', async () => {
  const log = jest.fn((msg: string) => msg);
  const next = jest.fn((ctx: Moleculer.Context) => ctx);
  const actionLogCallTrue: ActionOptions & CustomActionSchema = {
    logCall: { mask: 'password' as unknown as string[] }
  };
  const ctx = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: 'value', users: [{ user: 'foo', password: 'bar' }] }
  };

  const mw = getLogMiddleware(log);

  expect(log).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledTimes(0);

  (mw as any).localAction(next, actionLogCallTrue)(ctx);
  expect(log).toHaveBeenCalledTimes(1);
  expect(log).toHaveBeenCalledWith(
    `Action: '${(ctx.action as any).name}'. Caller: '${
      ctx.caller
    }'. Payload: {"key":"value","users":[{"user":"foo","password":"bar"}]}`
  );

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(ctx);
});

test('Log action middleware: no parameters', async () => {
  const log = jest.fn((msg: string) => msg);
  const next = jest.fn((ctx: Moleculer.Context) => ctx);
  const actionLogCallTrue: ActionOptions & CustomActionSchema = {
    logCall: { mask: true }
  };
  const ctx = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller'
  };

  const mw = getLogMiddleware(log);

  expect(log).toHaveBeenCalledTimes(0);
  expect(next).toHaveBeenCalledTimes(0);

  (mw as any).localAction(next, actionLogCallTrue)(ctx);
  expect(log).toHaveBeenCalledTimes(0);

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(ctx);
});
