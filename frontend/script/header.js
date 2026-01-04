const body = document.body

const user = JSON.parse(localStorage.getItem("user"))
const department = user?.departmentId ? `<br/>${user.department}` : ""

function logout(){
	localStorage.clear()
	location.reload()
}

body.insertAdjacentHTML("afterbegin", `
<header>
	<div>
		<a href="/">
			<h1>Complaint Management</h1>
		</a>
		${user?.role === "user" ? `<a href="/complaint/new">New complaint</a>` : ""}
	</div>
	<div id="left-header">
		${user ? `${user.email}<br/>${user.department ?? ""} ${user.role}<br/><button onclick="logout()">Logout</button>` :
			`<a href="/login">Login</a>`}
	</div>
</header>
`)
