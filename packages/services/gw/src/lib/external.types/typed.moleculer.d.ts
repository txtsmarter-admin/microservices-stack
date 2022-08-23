// 'import' used so this module augmentation have to be in separate file

import { ActionOptions } from 'typed-moleculer';

declare module 'typed-moleculer' {
  type LogCallMask = {
    mask: string[] | boolean;
  };

  type SagaCompensation = {
    action: string;
    paramKeys?: string[];
  };

  type Saga = {
    compensation: SagaCompensation;
  };

  interface CustomActionSchema {
    restricted?: boolean;
    changeState?: boolean;
    logCall?: boolean | LogCallMask;
    saga?: boolean | Saga;
  }

  export function Action(
    options?: ActionOptions & CustomActionSchema
  ): (target: any, key: string, descriptor: PropertyDescriptor) => void;
}
