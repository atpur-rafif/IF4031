import express from "express"
import sql from "sql-template-strings"
import { pool } from "./database.js"

export const departmentRouter = express.Router()

departmentRouter.get("/department", async (_, res) => {
	const { rows: department } = await pool.query(sql`SELECT department_id, name FROM departments`)
	return res.status(200).send({
		message: "Success",
		data: department
	})
})
