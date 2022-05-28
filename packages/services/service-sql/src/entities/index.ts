/**
 * Exports all the Mikro-ORM entities
 *
 * Copyright MyCompany 2022. All rights reserved.
 */

import { BaseEntity } from './base.entity';
import { TestEntity } from './test.entity';

export { TestEntity };

export const entities = [BaseEntity, TestEntity];
