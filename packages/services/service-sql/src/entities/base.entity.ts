/**
 * Base MikroORM entity for most other entities
 *
 * Copyright MyCompany 2022. All rights reserved.
 */
import { v4 } from 'uuid';
import { PrimaryKey, Property } from '@mikro-orm/core';

export class BaseEntity {
  @PrimaryKey()
  id: string = v4();

  @Property({ nullable: true, onCreate: () => new Date() })
  createdAt!: Date;

  @Property({
    nullable: true,
    onCreate: () => new Date(),
    onUpdate: () => new Date()
  })
  updatedAt!: Date;
}
