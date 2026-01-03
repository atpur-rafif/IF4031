async function showComplaints(){
	const headers = {}
	if(localStorage.getItem("token"))
		headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`

	const res = await fetch("/api/complaint", { headers })
	const { data: complaints } = await res.json()

	document.body.insertAdjacentHTML("beforeend", `<main id="complaint">
		${complaints.map(complaint => `<div>
			<a href="/complaint?id=${complaint.complaint_id}">${complaint.title} (${complaint.status})</a>
			<p>${new Date(complaint.created_at).toLocaleString()}</p>
			<p>From: ${complaint.user}</p>
			<p>To: ${complaint.department}</p>
		</div>`).join("")}
	</main>`)
}

showComplaints()
