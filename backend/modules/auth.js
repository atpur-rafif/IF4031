import z from "zod"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import express from "express"
import sql from "sql-template-strings"

import { pool } from "./database.js"

const JWT_SECRET = 'your_secret_key';

export const authMiddleware = (roles) => (req, _, next) => {
	const token = req.headers.authorization?.split(" ")[1];
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
	} catch (_) {
	}

	if (roles.length > 0 && roles.indexOf(req.user.role) === -1) throw {
		status: 401,
		message: "Unauthorized"
	}

	next();
}

export const authRouter = express.Router()

const loginSchema = z.object({
	email: z.email(),
	password: z.string()
})

authRouter.post('/login', async (req, res) => {
	const { email, password } = loginSchema.parse(req.body);

	const query = sql`SELECT user_id, users.name AS name, email, department_id, departments.name AS department, password, role
										FROM users LEFT JOIN departments USING (department_id) WHERE email = $1 LIMIT 1`
	const { rows: [user] } = await pool.query(query, [email]);
	const isMatch = user !== undefined && await bcrypt.compare(password, user.password);
	if (!isMatch) throw {
		status: 401,
		message: "Invalid credentials"
	}

	const payload = { userId: user.user_id, email: user.email, role: user.role }
	if(user.role === "department") {
		payload.department = user.department
		payload.departmentId = user.department_id
	}
	const token = jwt.sign(
		payload,
		JWT_SECRET,
		{ expiresIn: '1h' }
	);

	return res.json({
		message: 'Login successful',
		token, payload
	});
});
