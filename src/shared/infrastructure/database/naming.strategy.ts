import pluralize from 'pluralize';
import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

export class SnakePluralNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(targetName: string, userSpecifiedName: string | undefined): string {
    if (userSpecifiedName) {
      return userSpecifiedName;
    }

    // Strip 'OrmEntity' or 'Entity' suffixes before pluralizing & snake_casing
    const cleanedTarget = targetName
      .replace(/OrmEntity$/, '')
      .replace(/Entity$/, '');

    const snake = toSnakeCase(cleanedTarget);
    return pluralize(snake);
  }

  columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[],
  ): string {
    if (customName) {
      return customName;
    }

    const allPrefixes = [...embeddedPrefixes, propertyName];
    return allPrefixes.map((prefix) => toSnakeCase(prefix)).join('_');
  }

  relationName(propertyName: string): string {
    return toSnakeCase(propertyName);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return toSnakeCase(`${relationName}_${referencedColumnName}`);
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
  ): string {
    return toSnakeCase(
      `${firstTableName}_${firstPropertyName.replace(/\./g, '_')}_${secondTableName}`,
    );
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return toSnakeCase(`${tableName}_${columnName || propertyName}`);
  }
}
