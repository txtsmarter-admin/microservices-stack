/**
 * Test entity for Mikro-ORM
 *
 * Copyright MyCompany 2022. All rights reserved.
 */

import { Entity, Property } from '@mikro-orm/core';

import { BaseEntity } from './base.entity';

@Entity()
export class TestEntity extends BaseEntity {
  @Property()
  aKey!: string;

  @Property()
  aValue!: string;

  constructor(data: Omit<TestEntity, keyof BaseEntity>) {
    super();
    Object.assign(this, data);
  }
}
