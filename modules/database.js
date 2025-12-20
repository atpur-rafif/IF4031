import pg from "pg";

export const client = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

export async function initDatabase(){
	await client.connect();
}
