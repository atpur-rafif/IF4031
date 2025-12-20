import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import express from "express"

import { client } from "./database.js"

const JWT_SECRET = 'your_secret_key';

export function authMiddleware(req, _, next) {
	const token = req.headers.authorization?.split(" ")[1];

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (_) {
		throw {
			status: 401,
			message: "Unauthorized"
		}
	}
}

export const authRouter = express.Router()
authRouter.post('/login', async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) throw {
		status: 400,
		message: "Email and password are required"
	}

	const query = "SELECT user_id, name, email, password, role FROM users WHERE email = $1 LIMIT 1"
	console.log(query)
	const { rows: [user] } = await client.query(query, [email]);
	const isMatch = user !== undefined && await bcrypt.compare(password, user.password);
	if (!isMatch) throw {
		status: 401,
		message: "Invalid credentials"
	}

	const token = jwt.sign(
		{ user_id: user.user_id, email: user.email, role: user.role },
		JWT_SECRET,
		{ expiresIn: '1h' }
	);

	delete user.password
	return res.json({
		message: 'Login successful',
		token,
		user: user,
	});
});
