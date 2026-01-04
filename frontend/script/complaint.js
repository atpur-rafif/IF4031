const urlParams = new URLSearchParams(window.location.search);
const complaintId = urlParams.get('id');
const main = document.createElement("main")

async function showComplaint(){
	const headers = {}
	if(localStorage.getItem("token"))
		headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`

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
<section>
	<form id="new-comment">
		<p>New Comment</p>
		<textarea name="comment" rows="4" style="width: 100%; resize: vertical; margin-bottom: 0.5rem;"></textarea>
		<input type="checkbox" name="anonymous" value="true">
		<span>Anonymous</span>
		<button style="margin-left: 3rem;">Submit</button>
	</form>
</section>
</main>
`

	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			const form = document.querySelector("#new-comment")
			form.addEventListener("submit", async (e) => {
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
		})
	})
}

showComplaint()
