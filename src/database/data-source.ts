import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakePluralNamingStrategy } from '../shared/infrastructure/database/naming.strategy';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'postgres',
  ssl:
    process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  namingStrategy: new SnakePluralNamingStrategy(),
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
