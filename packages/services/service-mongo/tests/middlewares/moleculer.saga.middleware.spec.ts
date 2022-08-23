/**
 * Unit tests for saga middleware
 *
 * Copyright MyCompany 2022. All rights reserved.
 */
import Moleculer, { Errors, ServiceBroker } from 'moleculer';
import { ActionOptions, CustomActionSchema } from 'typed-moleculer';

import { globalSetup, globalTearDown } from '../setup';
import { getSagaMiddleware } from '../../src/middlewares/moleculer.saga.middleware';

// --- CARS SERVICE ---
const carServiceSchema: Moleculer.ServiceSchema = {
  name: 'cars',
  actions: {
    reserve: {
      saga: {
        compensation: {
          action: 'cars.cancel',
          paramKeys: ['id']
        }
      },
      handler(ctx) {
        ctx.broker.logger.info('Car with id 5 is reserved.');
        return {
          id: 5,
          name: 'Honda Civic'
        };
      }
    },

    cancel: {
      handler(ctx) {
        ctx.broker.logger.warn(
          `Cancel car reservation of id: ${ctx.params.id}`
        );
      }
    }
  }
};
// --- HOTELS SERVICE ---
const hotelServiceSchema: Moleculer.ServiceSchema = {
  name: 'hotels',
  actions: {
    book: {
      saga: {
        compensation: {
          action: 'hotels.cancel',
          paramKeys: ['id']
        }
      },
      handler(ctx) {
        ctx.broker.logger.info('Hotel with id 8 is booked.');
        return {
          id: 8,
          name: 'Holiday Inn',
          from: '2019-08-10',
          to: '2019-08-18'
        };
      }
    },

    cancel: {
      handler(ctx) {
        ctx.broker.logger.warn(
          `Cancel hotel reservation of id: ${ctx.params.id}`
        );
      }
    }
  }
};
// --- FLIGHTS SERVICE ---
const flightServiceSchema: Moleculer.ServiceSchema = {
  name: 'flights',
  actions: {
    book: {
      saga: {
        compensation: {
          action: 'flights.cancel',
          paramKeys: ['id']
        }
      },
      handler(ctx) {
        if (ctx.params.pass) {
          ctx.broker.logger.info('Flight is booked.');
          return {
            id: 2,
            number: 'SQ318',
            from: 'SIN',
            to: 'LHR'
          };
        } else {
          ctx.broker.logger.error('Unable to book flight!');
          throw new Errors.MoleculerError('Unable to book flight!');
        }
      }
    },

    cancel: {
      handler(ctx) {
        this.logger.warn(`Cancel flight ticket of id: ${ctx.params.id}`);
      }
    }
  }
};
// --- TRIP SAGA SERVICE ---
const tripServiceSchema: Moleculer.ServiceSchema = {
  name: 'trip-saga',
  actions: {
    createTrip: {
      saga: true,
      async handler(ctx) {
        try {
          const car = await ctx.call('cars.reserve');
          const hotel = await ctx.call('hotels.book');
          const flight = await ctx.call('flights.book', {
            pass: ctx.params.pass
          });
          ctx.broker.logger.info(
            `Trip is created successfully: ${JSON.stringify({
              car,
              flight,
              hotel
            })}`
          );
          return { car, flight, hotel };
        } catch (err: any) {
          ctx.broker.logger.error(
            `Trip could not be created. Reason: ${err.message}`
          );
          throw err;
        }
      }
    }
  }
};

beforeAll(async () => {
  await globalSetup();
});

afterAll(async () => {
  await globalTearDown();
});

afterEach(() => {
  jest.clearAllMocks();
});

test('Saga middleware: no saga', async () => {
  const next = jest.fn((ctx: Partial<Moleculer.Context>) =>
    Promise.resolve(ctx)
  );
  const actionWithoutSaga: ActionOptions & CustomActionSchema = {
    saga: false
  };
  const ctx: Partial<Moleculer.Context> = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: 'value' },
    meta: {}
  };

  const mw = getSagaMiddleware();

  (mw as any).localAction(next, actionWithoutSaga)(ctx);

  expect(next).toHaveBeenCalledTimes(1);
  expect((ctx.meta as any).$saga).toBeUndefined();
});

test('Saga middleware: single action pass', async () => {
  const next = jest.fn(() => Promise.resolve({ id: 8 }));
  const actionWithSaga: ActionOptions & CustomActionSchema = {
    saga: {
      compensation: {
        action: 'service.compensation',
        paramKeys: ['id']
      }
    }
  };
  const ctx: Partial<Moleculer.Context> = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: 'value' },
    meta: {}
  };

  const mw = getSagaMiddleware();

  const res = (mw as any).localAction(next, actionWithSaga)(ctx);

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(ctx);
  await expect(res).resolves.toEqual({ id: 8 });
  expect((ctx.meta as any).$saga).toBeDefined();
});

test('Saga middleware: single action rejection', async () => {
  const next = jest.fn(() => Promise.reject(`You can't handle the truth!`));
  const actionWithSaga: ActionOptions & CustomActionSchema = {
    saga: {
      compensation: {
        action: 'service.compensation',
        paramKeys: ['id']
      }
    }
  };
  const ctx = {
    action: {
      name: 'TestAction'
    },
    caller: 'TestCaller',
    params: { key: 'value' },
    meta: {}
  };

  const mw = getSagaMiddleware();

  const res = (mw as any).localAction(next, actionWithSaga)(ctx);

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith(ctx);
  await expect(res).rejects.toBeTruthy();
});

test('Saga middleware: multiple services with pass', async () => {
  const sagaMiddleware = getSagaMiddleware();
  const broker = new ServiceBroker({
    middlewares: [sagaMiddleware],
    logLevel: 'fatal'
  });

  // create cancel mocks
  const mockCarCancel = jest.fn(() => Promise.resolve('Car canceled'));
  const mockHotelCancel = jest.fn(() => Promise.resolve('Hotel canceled'));
  const mockFlightCancel = jest.fn(() => Promise.resolve('Flight canceled'));
  // store the original cancel functions
  const carCancel = (carServiceSchema.actions as Moleculer.ServiceActionsSchema)
    .cancel;
  const hotelCancel = (
    hotelServiceSchema.actions as Moleculer.ServiceActionsSchema
  ).cancel;
  const flightCancel = (
    flightServiceSchema.actions as Moleculer.ServiceActionsSchema
  ).cancel;
  // replace the cancel functions with the mocks
  (carServiceSchema.actions as Moleculer.ServiceActionsSchema).cancel =
    mockCarCancel;
  (hotelServiceSchema.actions as Moleculer.ServiceActionsSchema).cancel =
    mockHotelCancel;
  (flightServiceSchema.actions as Moleculer.ServiceActionsSchema).cancel =
    mockFlightCancel;
  broker.createService(carServiceSchema);
  broker.createService(hotelServiceSchema);
  broker.createService(flightServiceSchema);
  broker.createService(tripServiceSchema);
  await broker.start();
  await broker.waitForServices([
    carServiceSchema.name,
    hotelServiceSchema.name,
    flightServiceSchema.name
  ]);

  await expect(
    broker.call('trip-saga.createTrip', { pass: true })
  ).resolves.toBeDefined();
  expect(mockCarCancel).toHaveBeenCalledTimes(0);
  expect(mockHotelCancel).toHaveBeenCalledTimes(0);
  expect(mockFlightCancel).toHaveBeenCalledTimes(0);
  await broker.stop();

  // restore cancel functions
  (carServiceSchema.actions as Moleculer.ServiceActionsSchema).cancel =
    carCancel;
  (hotelServiceSchema.actions as Moleculer.ServiceActionsSchema).cancel =
    hotelCancel;
  (flightServiceSchema.actions as Moleculer.ServiceActionsSchema).cancel =
    flightCancel;
});

test('Saga middleware: multiple services with rejection', async () => {
  const sagaMiddleware = getSagaMiddleware();
  const broker = new ServiceBroker({
    middlewares: [sagaMiddleware],
    logLevel: 'fatal'
  });

  // create cancel mocks
  const mockCarCancel = jest.fn(() => Promise.resolve('Car canceled'));
  const mockHotelCancel = jest.fn(() => Promise.resolve('Hotel canceled'));
  const mockFlightCancel = jest.fn(() => Promise.resolve('Flight canceled'));
  // store the original cancel functions
  const carCancel = (carServiceSchema.actions as Moleculer.ServiceActionsSchema)
    .cancel;
  const hotelCancel = (
    hotelServiceSchema.actions as Moleculer.ServiceActionsSchema
  ).cancel;
  const flightCancel = (
    flightServiceSchema.actions as Moleculer.ServiceActionsSchema
  ).cancel;
  // replace the cancel functions with the mocks
  (carServiceSchema.actions as Moleculer.ServiceActionsSchema).cancel =
    mockCarCancel;
  (hotelServiceSchema.actions as Moleculer.ServiceActionsSchema).cancel =
    mockHotelCancel;
  (flightServiceSchema.actions as Moleculer.ServiceActionsSchema).cancel =
    mockFlightCancel;
  broker.createService(carServiceSchema);
  broker.createService(hotelServiceSchema);
  broker.createService(flightServiceSchema);
  broker.createService(tripServiceSchema);
  await broker.start();
  await broker.waitForServices([
    carServiceSchema.name,
    hotelServiceSchema.name,
    flightServiceSchema.name
  ]);

  await expect(
    broker.call('trip-saga.createTrip', { pass: false })
  ).rejects.toBeDefined();
  expect(mockCarCancel).toHaveBeenCalledTimes(1);
  expect(mockHotelCancel).toHaveBeenCalledTimes(1);
  expect(mockFlightCancel).toHaveBeenCalledTimes(0);
  await broker.stop();

  // restore cancel functions
  (carServiceSchema.actions as Moleculer.ServiceActionsSchema).cancel =
    carCancel;
  (hotelServiceSchema.actions as Moleculer.ServiceActionsSchema).cancel =
    hotelCancel;
  (flightServiceSchema.actions as Moleculer.ServiceActionsSchema).cancel =
    flightCancel;
});
