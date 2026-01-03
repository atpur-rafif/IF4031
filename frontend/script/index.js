const main = document.querySelector("#main")

async function showComplaints(){
	const res = await fetch("/api/complaint")
	const { data: complaints } = await res.json()
	console.log(complaints)

	main.innerHTML = `<div id="complaint">
		${complaints.map(complaint => `<div>
			<a href="/complaint/${complaint.complaint_id}">${complaint.title} (${complaint.status})</a>
			<p>From: ${complaint.user ?? "Anonymous"}</p>
			<p>To: ${complaint.department}</p>
		</div>`).join("")}
	</div>`
}

showComplaints()
