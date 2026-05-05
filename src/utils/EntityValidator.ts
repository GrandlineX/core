import { IDataBase } from '../lib/index.js';
import { ColumnPropMap } from '../classes/annotation/index.js';

export type ValidationInterface = {
  valid: boolean;
  invalidKey: string[];
};

export class EntityValidator {
  static validateManualObj(
    db: IDataBase<any, any>,
    entity: string,
    value: any,
    update: boolean,
  ): ValidationInterface {
    const meta = db.getEntityMeta();
    const ent = meta.find((e) => e.key === entity);
    if (!ent || typeof value !== 'object') {
      throw new Error('Validation failed');
    }
    return this.validateObj(ent.meta, value, update);
  }

  static validateObj(
    meta: ColumnPropMap<any>,
    value: any,
    update: boolean,
  ): ValidationInterface {
    if (typeof value !== 'object' || !value || Array.isArray(value)) {
      return {
        valid: false,
        invalidKey: ['value is not an object'],
      };
    }
    try {
      const fields: { valid: boolean; key: string }[] = [];

      meta.forEach((el, key) => {
        if (!update || value[key] !== undefined) {
          fields.push({
            valid: this.validateObjKey(meta, key as string, value[key]),
            key: key as string,
          });
        }
      });

      Object.keys(value).forEach((key) => {
        if (!meta.has(key)) {
          fields.push({ key, valid: false });
        }
      });

      return {
        valid: !fields.some((el) => !el.valid),
        invalidKey: fields.filter((el) => !el.valid).map((el) => el.key),
      };
    } catch (e) {
      return { valid: false, invalidKey: ['unknown'] };
    }
  }

  static validateObjKey(
    metaContainer: ColumnPropMap<any>,
    key: string,
    value: unknown,
  ): boolean {
    if (value === undefined) return false;

    const meta = metaContainer.get(key);
    if (!meta) return false;

    if (meta.canBeNull && value === null) return true;

    switch (meta.dataType) {
      case 'serial':
      case 'int':
      case 'long':
      case 'double':
      case 'float':
        return typeof value === 'number';
      case 'string':
      case 'text':
      case 'uuid':
        return typeof value === 'string';
      case 'boolean':
        return typeof value === 'boolean' || value === 0 || value === 1;
      case 'date':
        return (
          value instanceof Date ||
          (typeof value === 'string' &&
            !Number.isNaN(new Date(value).getTime()))
        );

      case 'json':
        return typeof value === 'object';
      case 'blob':
        return value instanceof Buffer;
      default:
        return false;
    }
  }
}
