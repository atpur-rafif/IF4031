import z from "zod"
import express from "express"
import sql from "sql-template-strings"
import { pool, transaction } from "./database.js";
import { authMiddleware } from "./auth.js"
import { fileUpload } from "./body.js";

const visibilityEnum = ['public', 'private'];
const statusEnum = ['open', 'closed', 'in-progress'];

export const complaintRouter = express.Router()

export const createComplaintSchema = z.object({
  departmentId: z.coerce.number(),
  private: z.boolean().default(false),
  anonymous: z.boolean().default(false),
  title: z.string().max(255, "Title is too long"),
  description: z.string().min(1, "Description is required"),
});

complaintRouter.get("/complaint", authMiddleware([]), async (req, res) => {
	fileUpload.single("attachment"), async (req, res) => {
	if(req.user.role !== "user") throw {
		status: 401,
		message: "Only user can complaint"
	}

	const complaintData = createComplaintSchema.parse(req.body);
	const complaintId = await transaction(async (client) => {
		const { departmentId, private: _private, anonymous, title, description } = complaintData;
		const { rows: [{ complaint_id: complaintId }] } = await client.query(
			sql`INSERT INTO complaints (user_id, department_id, private, anonymous, title, status)
			    VALUES (${req.user.userId}, ${departmentId}, ${_private}, ${anonymous}, ${title}, 'open') RETURNING complaint_id`
		);

		const { rows: [{ comment_id: commentId }] } = await client.query(
			sql`INSERT INTO complaint_comments (complaint_id, user_id, anonymous, comment)
			    VALUES (${complaintId}, ${req.user.userId}, ${anonymous}, ${description}) RETURNING comment_id`,
		);

		if (req.file) {
			if (attachment.file) {
				await pool.query(
					sql`INSERT INTO attachments (comment_id, file_info)
					    VALUES (${commentId}, ${req.file.path})`,
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
