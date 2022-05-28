/**
 * Copyright MyCompany 2022. All rights reserved.
 */
// eslint-disable-next-line import/no-unresolved
import { PartialDeep } from 'type-fest';
import {
  ANY_VALUE,
  commonAuthorize,
  userCall
} from '../../src/lib/common.utils';
import { CTX } from '../../src/lib/moleculer/broker';
import { createAuth } from '../test.utils';

describe('userCall()', () => {
  test('Dummy coverage test', async () => {
    userCall({ meta: { auth: {} as any } });
  });
});

describe('commonAuthorize()', () => {
  describe('.throwIfUser()', () => {
    test('context without meta', async () => {
      const ctx = {} as any;

      await expect(async () =>
        commonAuthorize(ctx)
          .throwIfUser()
          .cannot('manage', 'all')
          .where({ clientId: '1' })
      ).rejects.toMatchObject({ code: 401 });
    });

    test('Match condition', async () => {
      const ctx: PartialDeep<CTX> = {
        meta: {
          auth: createAuth(ab => {
            ab.can('do', 'something', { clientId: '1' });
          })
        }
      };

      commonAuthorize(ctx as CTX)
        .throwIfUser()
        .cannot('do' as any, 'something' as any)
        .where({ clientId: '1' });
    });

    test('Do not match condition', async () => {
      const ctx: PartialDeep<CTX> = {
        meta: {
          auth: createAuth(ab => {
            ab.can('do', 'something', { clientId: '1' });
          })
        }
      };

      await expect(async () =>
        commonAuthorize(ctx as CTX)
          .throwIfUser()
          .cannot('do' as any, 'something' as any)
          .where({ clientId: '2' })
      ).rejects.toMatchObject({ code: 403 });
    });

    test('Condition match any value', async () => {
      const ctx: PartialDeep<CTX> = {
        meta: {
          auth: createAuth(ab => {
            ab.can('do', 'something', { clientId: '1' });
          })
        }
      };

      await expect(async () =>
        commonAuthorize(ctx as CTX)
          .throwIfUser()
          .cannot('do' as any, 'something' as any)
          .where({ clientId: ANY_VALUE })
      ).rejects.toMatchObject({ code: 403 });
    });

    test('Unauthorized - no conditions', async () => {
      const ctx: PartialDeep<CTX> = {
        meta: {
          auth: createAuth(ab => {
            ab.can('do', 'something', { clientId: '1' });
          })
        }
      };

      await expect(async () =>
        commonAuthorize(ctx as CTX)
          .throwIfUser()
          .cannot('do' as any, 'something_else' as any)
          .where({})
      ).rejects.toMatchObject({ code: 403 });
    });

    test('Undefined permissions', async () => {
      const ctx: PartialDeep<CTX> = {
        meta: {
          auth: {}
        }
      };

      await expect(async () =>
        commonAuthorize(ctx as any)
          .throwIfUser()
          .cannot('do' as any, 'something' as any)
          .where({ clientId: '1' })
      ).rejects.toMatchObject({ code: 403 });
    });
  });

  describe('.doesUser()', () => {
    test('context without meta', async () => {
      const ctx = {} as any;

      await expect(async () =>
        commonAuthorize(ctx)
          .doesUser()
          .can('manage', 'all')
          .where({ clientId: '1' })
      ).rejects.toMatchObject({ code: 401 });
    });

    test('Authorized', async () => {
      const ctx: PartialDeep<CTX> = {
        meta: {
          auth: createAuth(ab => {
            ab.can('do', 'something', { clientId: '1' });
          })
        }
      };

      expect(
        commonAuthorize(ctx as any)
          .doesUser()
          .can('do' as any, 'something' as any)
          .where({ clientId: '1' })
      ).toBe(true);
    });

    test('UNauthorized', async () => {
      const ctx: PartialDeep<CTX> = {
        meta: {
          auth: createAuth(ab => {
            ab.can('do', 'something', { clientId: '1' });
          })
        }
      };

      expect(
        commonAuthorize(ctx as any)
          .doesUser()
          .can('do' as any, 'something' as any)
          .where({ clientId: '2' })
      ).toBe(false);
    });

    test('Undefined permissions', async () => {
      const ctx: PartialDeep<CTX> = {
        meta: {
          auth: {}
        }
      };

      expect(
        commonAuthorize(ctx as any)
          .doesUser()
          .can('do' as any, 'something' as any)
          .where({ clientId: '1' })
      ).toBe(false);
    });
  });
});
