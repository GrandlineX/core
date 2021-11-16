import CoreEntity from '../classes/CoreEntity';

/**
 * Convert Camel case string to snake case
 * @param str
 */
export function camelToSnakeCase(str: string): string {
  if (str.length === 0) {
    return str;
  }
  const className = str.substring(0, 1).toLowerCase() + str.substring(1);
  return className.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export interface ClassNameInterface {
  className: string;
  tableName: string;
}

/**
 * getTableName  by entity
 * @param entity
 */
export function getEntityNames(entity: CoreEntity): ClassNameInterface {
  const { name } = entity.constructor;
  return {
    className: name,
    tableName: camelToSnakeCase(name),
  };
}
