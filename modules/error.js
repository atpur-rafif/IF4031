import z from "zod";

z.config({
	customError: (iss) => {
		return `Invalid ${iss.path.join(".")}, expected ${iss.expected}`
	}
})

export function errorMiddleware(err, _, res, next){
	if (res.headersSent)
		return next(err);

	if (err.status && err.message) res.status(err.status).send({ message: err.message });
	else if(err instanceof z.ZodError){
		return res.status(400).send({ message: err.issues.map(v => v.message) })
	} else {
		console.error(err)
		return res.status(500).send({ message: "Internal Server Error" });
	}
}
