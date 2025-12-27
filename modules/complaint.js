import z from "zod"
import express from "express"
import sql from "sql-template-strings"
import { pool, transaction } from "./database.js";
import { authMiddleware } from "./auth.js"
import { fileUpload } from "./body.js";

const entriesPerPage = 100
const complaintStatus = ['open', 'in_progress', 'resolved']

export const complaintRouter = express.Router()

export const updateComplaintStatusSchema = z.object({
	complaintId: z.coerce.number(),
	status: z.enum(complaintStatus)
})

export const createComplaintSchema = z.object({
  departmentId: z.coerce.number(),
  private: z.boolean().default(false),
  anonymous: z.boolean().default(false),
  title: z.string().max(255, "Title is too long"),
  description: z.string().min(1, "Description is required"),
});

complaintRouter.patch("/complaint/status", authMiddleware(["department"]), async (req, res) => {
	const { status, complaintId } = updateComplaintStatusSchema.parse(req.body);

	const { rows: [complaint] } =
		await pool.query(sql`SELECT department_id FROM complaints WHERE complaint_id = ${complaintId}`)
	if(!complaint) throw {
		status: 404,
		message: "Unknown complaint"
	}

	if(complaint.department_id !== req.user.departmentId) throw {
		status: 401,
		message: "Unauthorized"
	}

	await pool.query(sql`UPDATE complaints SET status = ${status} WHERE complaint_id = ${complaintId}`)

	return res.status(201).send({
		message: 'Complain status updated',
	})
})

complaintRouter.get("/complaint", authMiddleware([]), async (req, res) => {
	const role = req.user?.role
	const select = sql`
		SELECT complaint_id, user_id, users.name AS user, complaints.department_id, private, anonymous, title, status
		FROM complaints JOIN users USING(user_id)`

	const roleFilter =
		role === "admin" ? sql`` :
		role === "department" ? sql` WHERE private = false OR department_id = ${req.user.departmentId}` :
		role === "user" ? sql` WHERE private = false OR user_id = ${req.user.userId}` :
			sql` WHERE private = false`

	const counter = sql`SELECT COUNT(1) FROM complaints`
	const { rows: [{ count }] } = await pool.query(counter.append(roleFilter))
	const maxPage = Math.max(Math.ceil(count / entriesPerPage), 1)
	const page = Math.max(req.query.page ?? 0, 0)
	console.log(page, maxPage, count)

	if(page >= maxPage) throw {
		status: 500,
		message: "Invalid page"
	}

	const start = page * entriesPerPage;
	const end = start + entriesPerPage;
	const pagination = sql` OFFSET ${start} LIMIT ${end}`

	const { rows } = await pool.query(select.append(roleFilter).append(pagination))
	const data = rows.map(entry => {
		if(!entry.anonymous) {
			delete entry.user_id
			delete entry.user
		}

		return entry
	})
	return res.json({ data, maxPage })
})

complaintRouter.post("/complaint", authMiddleware(["user"]),
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
