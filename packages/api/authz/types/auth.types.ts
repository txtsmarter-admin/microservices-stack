import * as jf from 'joiful';
import { ID } from './id';

export class Rule {
  @jf.string().required()
  action!: string;

  @jf.string().required()
  subject!: string;

  @jf.boolean().optional().allow(null)
  inverted?: boolean | null;
}

export class RuleCondition {
  @jf.string().optional()
  clientId?: ID | null;
}

export class Permissions {
  @jf.array({ elementClass: Rule })
  rules!: Rule[];
}

export class Auth {
  @jf.string().required()
  userId!: ID;

  @jf.object().required()
  permissions!: Permissions;
}

export type ContextMeta = {
  auth: Auth;
};
