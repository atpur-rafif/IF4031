import express from 'express';

import { body } from './modules/body.js';
import { authRouter, authMiddleware } from './modules/auth.js';
import { errorMiddleware } from './modules/error.js';
import { initDatabase } from './modules/database.js';

const port = 8080;
const app = express();
app.use(body)

app.use(authRouter)
app.get('/need-auth', authMiddleware, async (req, res) => {
	res.send(req.user)
})
app.get('/*path', () => {
	throw {
		status: 404,
		message: "Not Found"
	}
});


app.use(errorMiddleware)

await initDatabase()
app.listen(port, (error) => {
	if(error) console.error(error)
	else console.log(`Server running at http://localhost:${port}`);
});
