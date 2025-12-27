import multer from "multer"
import bodyParser from "body-parser"

export const fileUpload = multer({ dest: "uploads/" })

export const body = [
	bodyParser.urlencoded(),
	bodyParser.json(),
	fileUpload.none()
]
