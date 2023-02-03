import { IDataBase } from '../lib';
import { ColumnPropMap } from '../classes/annotation';

export type ValidationInterface = {
  valid: boolean;
  invalidKey: string[];
};

export class EntityValidator {
  static validateManualObj(
    db: IDataBase<any, any>,
    entity: string,
    value: any,
    update: boolean
  ): ValidationInterface {
    const meta = db.getEntityMeta();
    const ent = meta.find((e) => e.key === entity);
    if (!ent || typeof value !== 'object') {
      throw new Error('Validation failed');
    }
    return this.validateObj(ent.meta, entity, value, update);
  }

  static validateObj(
    meta: ColumnPropMap<any>,
    entity: string,
    value: any,
    update: boolean
  ): ValidationInterface {
    try {
      const fields: { valid: boolean; key: string }[] = [];

      meta.forEach((el, key) => {
        if (!update || value[key] !== undefined) {
          fields.push(
            this.validateObjKey(meta, entity, key as string, value[key])
          );
        }
      });

      const keys = Object.keys(value);
      for (const key of keys) {
        if (!meta.has(key)) {
          fields.push({
            key,
            valid: false,
          });
        }
      }

      return {
        valid: !fields.find((el) => !el.valid),
        invalidKey: fields.filter((el) => !el.valid).map((el) => el.key),
      };
    } catch (e) {
      return {
        valid: false,
        invalidKey: ['unknown'],
      };
    }
  }

  static validateObjKey(
    metaContainer: ColumnPropMap<any>,
    entity: string,
    key: string,
    value: unknown
  ): { valid: boolean; key: string } {
    const err = () => {
      return {
        valid: false,
        key,
      };
    };

    if (value === undefined) {
      return err();
    }

    const meta = metaContainer.get(key);
    if (!meta) {
      return err();
    }

    if (meta.canBeNull && value === null) {
      return {
        valid: true,
        key,
      };
    }

    switch (meta.dataType) {
      case 'serial':
      case 'int':
      case 'double':
      case 'float':
        if (typeof value !== 'number') {
          return err();
        }
        break;
      case 'string':
      case 'text':
      case 'uuid':
        if (typeof value !== 'string') {
          return err();
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean' && !(value === 0 || value === 1)) {
          return err();
        }
        break;

      case 'date':
        if (!(value instanceof Date)) {
          if (typeof value === 'string') {
            const date = new Date(value);
          } else {
            return err();
          }
        }

        break;

      case 'json':
        if (typeof value !== 'object') {
          return err();
        }
        break;
      case 'blob':
        return err();
      default:
        throw new Error('Validation failed: Invalid type');
    }

    return {
      valid: true,
      key,
    };
  }
}
