/**
 * Naming strategy for Mikro-ORM
 * Copyright MyCompany 2022. All rights reserved.
 */
import { MongoNamingStrategy } from '@mikro-orm/core';

export class TableNamingStrategy extends MongoNamingStrategy {
  classToTableName(entityName: string): string {
    // get default table name from parent naming strategy
    const original = super.classToTableName(entityName);

    // for prepend service and underscore name to table name if it doesn't already start with it
    if (!original.startsWith('service-mongo')) {
      return `service-mongo-${original}`;
    }

    return original;
  }
}
