export const PASSWORD_VALIDATOR: RegExp = /^(?=.*\d).{8,}$/;

export function validatePasswordSecurity(pass: string): boolean {
  return PASSWORD_VALIDATOR.test(pass);
}
