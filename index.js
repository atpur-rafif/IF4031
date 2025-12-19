const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer')
const bodyParser = require('body-parser')
const { Client } = require('pg');

const app = express();
const port = 8080;

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});
client.connect();

const JWT_SECRET = 'your_secret_key';
const upload = multer({ dest: "uploads/" })
app.use(express.json());
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
app.use(upload.none())

app.post('/login', async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) throw {
		status: 400,
		message: "Email and password are required"
	}

	const query = "SELECT user_id, name, email, password, role FROM users WHERE email = $1 LIMIT 1"
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

app.use((err, _, res, next) => {
	console.log(err)
	if (res.headersSent)
		return next(err);

	if (err.status && err.message) res.status(err.status).send({ error: err.message });
	else return res.status(500).send({ message: "Internal Server Error" });
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
