export function errorMiddleware(err, _, res, next){
	if (res.headersSent)
		return next(err);

	if (err.status && err.message) res.status(err.status).send({ message: err.message });
	else {
		console.error(err)
		return res.status(500).send({ message: "Internal Server Error" });
	}
}
