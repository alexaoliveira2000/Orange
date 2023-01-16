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
    buildNavBar(session);
    buildLogoutEvent(session);

    const url = `http://${window.location.host}/api/users/pending-headhunters`;
    axios.get(url)
        .then(response => {
            console.log(response.data.headhunters);
            buildPendingHeadhuntersTable(response.data.headhunters)
        })
        .catch(error => {

        });
}

var buildPendingHeadhuntersTable = function (headhunters) {
    var buildRow = function (headhunter) {
        let tr = document.createElement("tr");
        let headhunterName = document.createElement("td");
        let headhunterPicture = document.createElement("picture");
        let headhunterImage = document.createElement("img");
        let headhunterLogo = document.createElement("td");
        let headhunterEmail = document.createElement("td");
        let headhunterWebsite = document.createElement("td");
        let websiteLink = document.createElement("a");
        let headhunterActions = document.createElement("td");
        let acceptButton = document.createElement("button");
        let rejectButton = document.createElement("button");

        headhunterName.textContent = headhunter.name;
        headhunterImage.src = headhunter.logoUrl;
        headhunterImage.style.height = "50px";
        headhunterImage.style.width = "50px";
        headhunterEmail.textContent = headhunter.email;
        websiteLink.textContent = headhunter.websiteUrl;
        websiteLink.href = headhunter.websiteUrl;
        websiteLink.style.color = "black";
        headhunterActions.className = "text-end";
        acceptButton.className = "btn btn-primary";
        rejectButton.className = "btn btn-primary";
        acceptButton.textContent = "Accept";
        rejectButton.textContent = "Reject";
        acceptButton.id = "accept-headhunter";
        rejectButton.id = "reject-headhunter";

        acceptButton.addEventListener("click", function () {
            const url = `http://${window.location.host}/api/users/accept-headhunter`;
            axios.post(url, { key: headhunter.key })
                .then(response => {
                    window.location.reload();
                })
                .catch(error => {

                });
        });

        rejectButton.dataset.bsToggle = "modal";
        rejectButton.dataset.bsTarget = "#modal-2";
        let rejectConfirmation = document.getElementById("reject");

        rejectButton.onclick = function () {
            rejectConfirmation.onclick = function () {
                const url = `http://${window.location.host}/api/users/reject-headhunter`;
                axios.post(url, { key: headhunter.key })
                    .then(response => {
                        window.location.reload();
                    })
                    .catch(error => {

                    });
            }
        }
        /* rejectConfirmation.addEventListener("click", function () {
            const url = `http://${window.location.host}/api/users/reject-headhunter`;
            axios.post(url, { key: headhunter.key })
                .then(response => {
                    window.location.reload();
                })
                .catch(error => {

                });
        }); */

        headhunterPicture.appendChild(headhunterImage);
        headhunterLogo.appendChild(headhunterPicture);
        headhunterWebsite.appendChild(websiteLink);
        headhunterActions.appendChild(acceptButton);
        headhunterActions.appendChild(rejectButton);
        tr.appendChild(headhunterLogo);
        tr.appendChild(headhunterName);
        tr.appendChild(headhunterEmail);
        tr.appendChild(headhunterWebsite);
        tr.appendChild(headhunterActions);

        return tr;
    }

    let pendingTable = document.getElementById("pending-table");

    if (headhunters.length !== 0) {
        let div = document.createElement("div");
        let table = document.createElement("table");
        let thead = document.createElement("thead");
        let tr = document.createElement("tr");
        let headhunterName = document.createElement("th");
        let headhunterEmail = document.createElement("th");
        let headhunterWebsite = document.createElement("th");
        let headhunterLogo = document.createElement("th");
        let headhunterActions = document.createElement("th");

        div.className = "table-responsive";
        table.className = "table";
        headhunterName.textContent = "Name";
        headhunterEmail.textContent = "Email";
        headhunterWebsite.textContent = "Website";
        headhunterLogo.textContent = "Logo";
        headhunterActions.textContent = "Actions";
        headhunterActions.className = "text-end";

        tr.appendChild(headhunterLogo);
        tr.appendChild(headhunterName);
        tr.appendChild(headhunterEmail);
        tr.appendChild(headhunterWebsite);
        tr.appendChild(headhunterActions);
        thead.appendChild(tr);
        table.appendChild(thead);

        headhunters.forEach(headhunter => table.appendChild(buildRow(headhunter)));

        div.appendChild(table);
        pendingTable.appendChild(div);
    } else {
        let text = document.createElement("h4");
        text.textContent = "It seems there are no pending headhunter requests...";

        pendingTable.appendChild(document.createElement("br"));
        pendingTable.appendChild(text);
        pendingTable.appendChild(document.createElement("br"));
    }
}

var buildNavBar = function (session) {

    console.log("USER: " + JSON.stringify(session.user));

    var buildSignInButton = function () {
        let a = document.createElement("a");
        a.id = "orange-button";
        a.className = "btn btn-primary";
        a.role = "button";
        a.textContent = "Sign in";
        a.href = "/login";
        return a;
    }

    var buildDropdownButton = function () {
        let ul = document.createElement("ul");
        let li = document.createElement("li");
        let arrowDiv = document.createElement("div");
        let a = document.createElement("a");
        let span = document.createElement("span");
        let dropdownDiv = document.createElement("div");
        let profileItem = document.createElement("a");
        let friendsItem = document.createElement("a");
        let pendingHeadhuntersItem = document.createElement("a");
        let dividerDiv = document.createElement("div");
        let logoutItem = document.createElement("a");

        ul.className = "navbar-nav flex-nowrap ms-auto";
        li.className = "nav-item dropdown no-arrow";
        arrowDiv.className = "nav-item dropdown no-arrow";
        a.className = "dropdown-toggle nav-link";
        a.ariaExpanded = "false";
        a.dataset.bsToggle = "dropdown";
        a.href = "#";
        span.className = "d-none d-lg-inline me-2 text-gray-600 small";
        span.textContent = session.user.name;
        dropdownDiv.className = "dropdown-menu shadow dropdown-menu-end animated--grow-in";
        profileItem.id = "profileButton";
        profileItem.className = "dropdown-item";
        profileItem.href = "profile";
        profileItem.textContent = "Profile";
        friendsItem.className = "dropdown-item";
        friendsItem.href = "friends";
        friendsItem.textContent = "Friends";
        pendingHeadhuntersItem.className = "dropdown-item";
        pendingHeadhuntersItem.href = "pending-headhunters";
        pendingHeadhuntersItem.textContent = "Pending Headhunters";
        logoutItem.className = "dropdown-item";
        logoutItem.href = "#";
        logoutItem.dataset.bsToggle = "modal";
        logoutItem.dataset.bsTarget = "#modal-1";
        logoutItem.textContent = "Sign out";
        dividerDiv.className = "dropdown-divider";

        if (session.user.type === "job_seeker") dropdownDiv.appendChild(profileItem);
        if (session.user.type === "job_seeker") dropdownDiv.appendChild(friendsItem);
        if (session.user.type === "admin") dropdownDiv.appendChild(pendingHeadhuntersItem);
        dropdownDiv.appendChild(dividerDiv);
        dropdownDiv.appendChild(logoutItem);
        a.appendChild(span);
        arrowDiv.appendChild(a);
        arrowDiv.appendChild(dropdownDiv);
        li.appendChild(arrowDiv);
        ul.appendChild(li);

        return ul;
    }

    let jobOffersButton = document.getElementById("job-offers");
    let resumesButton = document.getElementById("resumes");
    let actionDiv = document.getElementById("actionDiv");

    if (!session.authenticated) {
        actionDiv.appendChild(buildSignInButton());
    } else if (session.user.type === "job_seeker") {
        jobOffersButton.style.display = "block";
        actionDiv.appendChild(buildDropdownButton());
    } else if (session.user.type === "headhunter") {
        resumesButton.style.display = "block";
        actionDiv.appendChild(buildDropdownButton());
    } else if (session.user.type === "admin") {
        jobOffersButton.style.display = "block";
        resumesButton.style.display = "block";
        actionDiv.appendChild(buildDropdownButton());
    }
}

var buildLogoutEvent = function (session) {
    if (session.authenticated) {
        let logoutConfirmation = document.getElementById("logout");
        logoutConfirmation.addEventListener("click", function () {
            const url = `http://${window.location.host}/api/logout`
            axios.post(url)
                .then(response => {
                    window.location.href = `http://${window.location.host}/login?userLogout`;
                })
                .catch(error => {
                    window.location.href = `http://${window.location.host}/`
                });
        });
    }
}

window.onload = checkAuthentication;