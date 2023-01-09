let checkAuthentication = function () {
    const url = `http://${window.location.host}/api/check-authentication`
    axios.get(url)
        .then(response => {
            init(response.data);
        })
        .catch(error => {

        });
}

let init = function (session) {
    console.log(session.authenticated)
    //buildNavBar(session);
}

let buildNavBar = function (session) {

    let buildActionButton = function (action) {
        if (action === "Sign in") {
            let a = document.createElement("a");
            a.id = "orange-button";
            a.className = "btn btn-primary";
            a.role = "button";
            a.textContent = action;
            a.href = "login.html";
            return a;
        } else {
            let button = document.createElement("button");
            button.id = "orange-button";
            button.className = "btn btn-primary";
            button.textContent = action;
            return button;
        }
    }

    let resumesButton = document.getElementById("resumes");
    let actionDiv = document.getElementById("actionDiv");

    if (!session.authenticated) {
        resumesButton.style.display = "none";
        actionDiv.appendChild(buildActionButton("Sign in"));
    } else if (session.user.type === "job_seeker") {
        resumesButton.style.display = "none";
        actionDiv.appendChild(buildActionButton("Sign out"));
    } else if (session.user.type === "headhunter") {
        
        actionDiv.appendChild(buildActionButton("Sign out"));
    } else {
        
        actionDiv.appendChild(buildActionButton("Sign out"));
    }
}

window.onload = checkAuthentication;