import pg from "pg";

export const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

export async function transaction(callback){
	const client = await pool.connect()
	try {
		await client.query('BEGIN')
		const result = await callback(client)
		await client.query('COMMIT')
		return result
	} catch (err) {
		await client.query('ROLLBACK')
		throw err
	} finally {
		client.release()
	}
}
