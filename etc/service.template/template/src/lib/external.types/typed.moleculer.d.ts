// 'import' used so this module augmentation have to be in separate file

import { ActionOptions } from 'typed-moleculer';

declare module 'typed-moleculer' {
  type LogCallMask = {
    mask: string[] | boolean;
  };
  interface CustomActionSchema {
    restricted?: boolean;
    changeState?: boolean;
    logCall?: boolean | LogCallMask;
  }

  export function Action<T>(
    options?: ActionOptions<T> & CustomActionSchema
  ): (target: any, key: string, descriptor: PropertyDescriptor) => void;
}
