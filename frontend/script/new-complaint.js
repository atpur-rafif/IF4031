if(!user)
	window.location = "/"

const headers = {}
if(localStorage.getItem("token"))
	headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`


async function initDepartment(){
	const department = document.querySelector("#department")
	const res = await fetch("/api/department") 
	const { data } = await res.json()

	department.innerHTML = data.map(v => `<option value="${v.department_id}">${v.name}</option>`).join("")
}

async function init(){
	await initDepartment()

	const form = document.querySelector("form")
	form.addEventListener("submit", async (e) => {
		e.preventDefault()
		const body = new FormData(e.target)

		const res = await fetch("/api/complaint", {
			headers,
			method: "POST",
			body: body
		})

		const json = await res.json()
		if(res.status === 200) {
			window.location.replace("/");
		} else alert(json.message)
	})
}

init()
