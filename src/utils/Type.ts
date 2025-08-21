export default class Type {
  static isUUID(str: string): boolean {
    const uidReg =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
    return uidReg.test(str);
  }

  static isIsoDate(data: string): boolean {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?$/.test(
      data,
    );
  }

  static isString(a: unknown): a is string {
    return typeof a === 'string' && a.length > 0;
  }

  static isNumber(a: unknown): a is number {
    return typeof a === 'number';
  }

  static isBoolean(a: unknown): a is boolean {
    return typeof a === 'boolean';
  }
}
