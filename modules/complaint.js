import z from "zod"
import express from "express"
import { transaction } from "./database.js";
import { authMiddleware } from "./auth.js"
import { fileUpload } from "./body.js";

const visibilityEnum = ['public', 'private'];
const statusEnum = ['open', 'closed', 'in-progress'];

export const complaintRouter = express.Router()

export const createComplaintSchema = z.object({
  departmentId: z.coerce.number(),
  visibility: z.enum(visibilityEnum, "Visibility must be either 'public' or 'private'"),
  title: z.string().max(255, "Title is too long"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(statusEnum).default('open'),
});

complaintRouter.post("/complaint", authMiddleware,
	fileUpload.single("attachment"), async (req, res) => {
	if(req.user.role !== "user") throw {
		status: 401,
		message: "Only user can complaint"
	}

	const complaintData = createComplaintSchema.parse(req.body);
	const complaintId = await transaction(async (client) => {
		const { departmentId, visibility, title, description, status } = complaintData;
		const result = await client.query(
			`INSERT INTO complaints (user_id, department_id, visibility, title, description, status)
			 VALUES ($1, $2, $3, $4, $5, $6) RETURNING complaint_id`,
			[req.user.userId, departmentId, visibility, title, description, status]
		);

		const complaintId = result.rows[0].complaint_id;

		if (req.file) {
			if (attachment.file) {
				const fileInfo = req.file.path;

				await pool.query(
					'INSERT INTO attachments (comment_id, file_info) VALUES ($1, $2)',
					[complaintId, fileInfo]
				);
			}
		}

		return complaintId
	})

	return res.status(201).json({
		message: 'Complaint created successfully',
		complaintId,
	});
})
