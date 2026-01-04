import z from "zod"
import express from "express"
import sql from "sql-template-strings"
import { pool, transaction } from "./database.js";
import { authMiddleware } from "./auth.js"

const entriesPerPage = 100
const complaintStatus = ['open', 'in_progress', 'resolved']

export const complaintRouter = express.Router()

export const updateComplaintStatusSchema = z.object({
	status: z.enum(complaintStatus)
})

export const upvoteComplaintSchema = z.object({
	up: z.coerce.boolean().default(true)
})

export const createComplaintSchema = z.object({
  departmentId: z.coerce.number(),
  private: z.coerce.boolean().default(false),
  anonymous: z.coerce.boolean().default(false),
  title: z.string().max(255, "Title is too long"),
  description: z.string().min(1, "Description is required"),
});

export const createCommentSchema = z.object({
  anonymous: z.coerce.boolean().default(false),
  comment: z.string().min(1, "Description is required"),
});

const sanitizeAnonymous = (item) => {
	if(!item) return item;

	if("anonymous" in item && item.anonymous){
		delete item.user_id
		if(item.user)
			item.user = "Anonymous"
	}

	return item
}

const createRoleFilter = (user) => {
	const role = user?.role
	return role === "admin" ? sql` WHERE 1 = 1` :
		role === "department" ? sql` WHERE complaints.department_id = ${user.departmentId}` :
		role === "user" ? sql` WHERE (private = false OR user_id = ${user.userId})` :
			sql` WHERE private = false`
}

const getComplaint = async (user, id) => {
	const filter = createRoleFilter(user).append(sql` AND complaint_id = ${id}`)
	const { rows: [complaint] } = await pool.query(sql`
		SELECT complaint_id, user_id, complaints.department_id, users.name AS user, departments.name AS department,
					 private, anonymous, title, status, complaints.created_at AS created_at
		FROM complaints JOIN users USING(user_id) JOIN departments ON complaints.department_id = departments.department_id`.append(filter))
	return sanitizeAnonymous(complaint)
}

complaintRouter.patch("/complaint/:id/status", authMiddleware(["department"]), async (req, res) => {
	const complaintId = req.params.id
	const { status } = updateComplaintStatusSchema.parse(req.body);

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

	return res.status(200).send({
		message: 'Complain status updated',
	})
})

complaintRouter.patch("/complaint/:id/vote", authMiddleware(["user"]), async (req, res) => {
	const complaintId = req.params.id
	const complaint = await getComplaint(req.user, complaintId)
	const { up } = upvoteComplaintSchema.parse(req.body);
	if(!complaint) throw {
		status: 404,
		message: "Unknown complaint"
	}

	if(up){
		await pool.query(sql`INSERT INTO complaint_upvotes (complaint_id, user_id) VALUES (${complaintId}, ${req.user.userId}) ON CONFLICT DO NOTHING`)
	} else{
		await pool.query(sql`DELETE FROM complaint_upvotes WHERE complaint_id = ${complaintId} AND user_id = ${req.user.userId}`)
	}

	return res.status(200).send({
		message: 'Complain upvote updated',
	})
})


complaintRouter.get("/complaint/:id", authMiddleware([]), async (req, res) => {
	const complaintId = req.params.id
	const complaint = await getComplaint(req.user, complaintId)

	if(!complaint) throw {
		status: 404,
		message: "Unknown complaint"
	}

	const { rows: comments } = await pool.query(sql`
		SELECT user_id, users.name AS user, departments.name AS department, anonymous, comment, complaint_comments.created_at AS created_at
		FROM complaint_comments JOIN users USING(user_id) LEFT JOIN departments USING(department_id)
		WHERE complaint_id = ${complaintId}
		ORDER BY comment_id`)

	const { rows: [upvote] } = await pool.query(sql`
		SELECT (SELECT COUNT(1) FROM complaint_upvotes WHERE complaint_id = ${complaintId}) AS count,
					 (SELECT COUNT(1) FROM complaint_upvotes WHERE complaint_id = ${complaintId} AND user_id = ${req.user.userId}) AS upvoted`)

	return res.status(200).send({
		message: 'Success',
		data: { complaint, comments: comments.map(sanitizeAnonymous), upvote }
	})
})

complaintRouter.get("/complaint", authMiddleware([]), async (req, res) => {
	const select = sql`
		SELECT complaint_id, user_id, complaints.department_id, users.name AS user, departments.name AS department,
					 private, anonymous, title, status, complaints.created_at AS created_at, COALESCE(upvote, 0) AS upvote
		FROM complaints JOIN users USING(user_id) JOIN departments ON complaints.department_id = departments.department_id
		LEFT JOIN (SELECT complaint_id, COUNT(1) AS upvote FROM complaint_upvotes GROUP BY complaint_id) USING(complaint_id)`

	const roleFilter = createRoleFilter(req.user)
	const counter = sql`SELECT COUNT(1) FROM complaints`
	const { rows: [{ count }] } = await pool.query(counter.append(roleFilter))
	const maxPage = Math.max(Math.ceil(count / entriesPerPage), 1)
	const page = Math.max(req.query.page ?? 0, 0)

	if(page >= maxPage) throw {
		status: 500,
		message: "Invalid page"
	}

	const start = page * entriesPerPage;
	const end = start + entriesPerPage;
	const pagination = sql` OFFSET ${start} LIMIT ${end}`

	const { rows } = await pool.query(select.append(roleFilter).append(pagination))
	const data = rows.map(sanitizeAnonymous)
	return res.json({ data, maxPage })
})

complaintRouter.post("/complaint", authMiddleware(["user"]), async (req, res) => {
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

		await client.query(
			sql`INSERT INTO complaint_comments (complaint_id, user_id, anonymous, comment)
			    VALUES (${complaintId}, ${req.user.userId}, ${anonymous}, ${description}) RETURNING comment_id`,
		);

		return complaintId
	})

	return res.status(200).json({
		message: 'Complaint created successfully',
		complaintId,
	});
})

complaintRouter.post("/complaint/:id/comment", authMiddleware(["user", "department"]), async (req, res) => {
	const complaintId = req.params.id
	const complaint = await getComplaint(req.user, complaintId)

	if(!complaint) throw {
		status: 404,
		message: "Unknown complaint"
	}

	const commentData = createCommentSchema.parse(req.body);
	const commentId = await transaction(async (client) => {
		const { anonymous, comment } = commentData;

		const { rows: [{ comment_id: commentId }] } = await client.query(
			sql`INSERT INTO complaint_comments (complaint_id, user_id, anonymous, comment)
			    VALUES (${complaintId}, ${req.user.userId}, ${anonymous}, ${comment}) RETURNING comment_id`,
		);

		return commentId
	})

	return res.status(200).json({
		message: 'Comment created successfully',
		commentId,
	});
})
