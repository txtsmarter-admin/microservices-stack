/**
 * Base MikroORM entity for most other entities
 *
 * Copyright MyCompany 2022. All rights reserved.
 */
import { PrimaryKey, Property, SerializedPrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';

export class BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property({ nullable: true, onCreate: () => new Date() })
  createdAt!: Date;

  @Property({
    nullable: true,
    onCreate: () => new Date(),
    onUpdate: () => new Date()
  })
  updatedAt!: Date;
}
