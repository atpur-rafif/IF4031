import pg from "pg";

export const pool = new pg.Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
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
