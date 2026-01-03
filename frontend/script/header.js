const body = document.body

const user = JSON.parse(localStorage.getItem("user"))
const department = user?.departmentId ? `<br/>${user.departmentId}` : ""

function logout(){
	localStorage.clear()
	location.reload()
}

body.insertAdjacentHTML("afterbegin", `
<header>
	<h1>Complaint</h1>
	<div id="left-header">
		${user ? `${user.email}<br/>${user.role}${department}<br/><button onclick="logout()">Logout</button>` : 
			`<a href="/login">Login</a>`}
	</div>
</header>
`)
