const login = document.querySelector("#login")

login.addEventListener("submit", async (e) => {
	e.preventDefault()
	const body = new FormData(e.target)

	const res = await fetch("/api/login", {
		method: "POST",
		body: body
	})

	const json = await res.json()
	console.log(json)
	if(res.status === 200) {
		localStorage.setItem("user", JSON.stringify(json.payload))
		localStorage.setItem("token", json.token)
		window.location.replace("/");
	} else alert(json.message)
})
