/**
 * Naming strategy for Mikro-ORM
 * Copyright MyCompany 2022. All rights reserved.
 */
{{#if sql}}
import { UnderscoreNamingStrategy } from '@mikro-orm/core';

export class TableNamingStrategy extends UnderscoreNamingStrategy {
  classToTableName(entityName: string): string {
    // get default table name from parent naming strategy
    const original = super.classToTableName(entityName);

    // for prepend service and underscore name to table name if it doesn't already start with it
    if (!original.startsWith('{{serviceName}}')) {
      return `{{serviceName}}_${original}`;
    }

    return original;
  }
}
{{/if}}
{{#if mongo}}
import { MongoNamingStrategy } from '@mikro-orm/core';

export class TableNamingStrategy extends MongoNamingStrategy {
  classToTableName(entityName: string): string {
    // get default table name from parent naming strategy
    const original = super.classToTableName(entityName);

    // for prepend service and underscore name to table name if it doesn't already start with it
    if (!original.startsWith('{{serviceName}}')) {
      return `{{serviceName}}-${original}`;
    }

    return original;
  }
}
{{/if}}