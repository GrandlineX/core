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

export function easyRelation(name: string) {
  return {
    key: 'e_id',
    relation: camelToSnakeCase(name),
  };
}

export interface ClassNameInterface {
  className: string;
  tableName: string;
}
