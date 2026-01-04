import express from 'express';

import { errorMiddleware } from './modules/error.js';

import { body } from './modules/body.js';
import { authRouter } from './modules/auth.js';
import { complaintRouter } from "./modules/complaint.js"
import { departmentRouter } from "./modules/department.js"

const port = 9000;
const app = express();
app.use(body)

const apiRouter = express.Router()
apiRouter.use(authRouter)
apiRouter.use(complaintRouter)
apiRouter.use(departmentRouter)

app.use("/api", apiRouter)
app.all('*path', () => {
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
