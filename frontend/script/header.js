const body = document.body

const user = localStorage.getItem("user")
console.log(user)

body.insertAdjacentHTML("afterbegin", `
<header>
	<h1>Complaint</h1>
	<div id="left-header">
		${user ? `` : `<a href="/login">Login</a>`}
	</div>
</header>
`)
