import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create a postgres client connection
const client = postgres(process.env.DATABASE_URL || '');

// Create a Drizzle instance with the schema
export const db = drizzle(client, { schema });

export type Database = typeof db;
