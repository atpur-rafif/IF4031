import express from 'express';

import { errorMiddleware } from './modules/error.js';

import { body } from './modules/body.js';
import { authRouter } from './modules/auth.js';
import { complaintRouter } from "./modules/complaint.js"

const port = 8080;
const app = express();
app.use(body)

app.use(authRouter)
app.use(complaintRouter)
app.all('/*path', () => {
	throw {
		status: 404,
		message: "Not Found"
	}
});

app.use(errorMiddleware)
app.listen(port, (error) => {
	if(error) console.error(error)
	else console.log(`Server running at http://localhost:${port}`);
});
