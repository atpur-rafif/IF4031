const urlParams = new URLSearchParams(window.location.search);
const complaintId = urlParams.get('id');
const main = document.createElement("main")

const headers = {}
if(localStorage.getItem("token"))
	headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`

function createNewComment(){
	const newCommentForm = document.createElement("form")
	newCommentForm.innerHTML = `
		<p>New Comment</p>
		<textarea name="comment" rows="4" style="width: 100%; resize: vertical; margin-bottom: 0.5rem;"></textarea>
		<input type="checkbox" name="anonymous" value="true">
		<span>Anonymous</span>
		<button style="margin-left: 3rem;">Submit</button>`

	newCommentForm.addEventListener("submit", async (e) => {
		e.preventDefault()

		const body = new FormData(e.target)
		const res = await fetch(`/api/complaint/${complaintId}/comment`, {
			headers,
			method: "POST",
			body: body
		})

		const json = await res.json()
		if(res.status === 200) showComplaint()
			else alert(json.message)
	})

	return newCommentForm
}

const listStatus = ["open", "in_progress", "resolved"]
function createButton(status){
	const div = document.createElement("div")

	const statusButton = document.createElement("button")
	const next = status === "open" ? "in_progress" : "resolved"
	statusButton.innerText = next === "in_progress" ? "start" : "close"

	statusButton.addEventListener("click", async (e) => {
		e.preventDefault()

		const res = await fetch(`/api/complaint/${complaintId}/status`, {
			headers: { ...headers, "content-type": "application/json" },
			method: "PATCH",
			body: JSON.stringify({ status: next })
		})

		const json = await res.json()
		if(res.status === 200) showComplaint()
		else alert(json.message)
	})

	div.insertAdjacentElement("beforeend", statusButton)

	return div
}

async function showComplaint(){
	const res = await fetch(`/api/complaint/${complaintId}`, { headers })
	const { data } = await res.json()

	if(!data){
		document.body.insertAdjacentHTML("beforeend", `
<main>Complaint Not Found or Unathorized</main>
`)
		return
	}

	const { complaint, comments } = data
	document.body.insertAdjacentElement("beforeend", main)

	main.innerHTML = `
<main id="complaint">
<div>
	<h2>${complaint.title}</h2>
	<p>${new Date(complaint.created_at).toLocaleString()}</p>
	<p>Status: ${complaint.status}</p>
	<p>From: ${complaint.user}</p>
	<p>To: ${complaint.department}</p>
</div>
<section id="comments">
${comments.map(v => `
	<div>
		<p>${v.user} (${new Date(v.created_at).toLocaleString()})</p>
		<p>${v.comment}</p>
	</div>
`).join("\n")}
</section>
<section id="action"></section>
</main>
`

	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			const action = document.querySelector("#action")
			if(complaint.status !== "resolved" && complaint.department_id === user?.departmentId)
				action.insertAdjacentElement("beforeend", createButton(complaint.status))

			if(user)
				action.insertAdjacentElement("beforeend", createNewComment())
		})
	})
}

showComplaint()
