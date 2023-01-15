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
    buildAddFriendRequest();
    friendRequestSubmit();

    let pathname = window.location.pathname;
    let pathnameArray = pathname.split("/");
    let value = pathnameArray[pathnameArray.length - 1];
    const url = `http://${window.location.host}/api/friends/${value}`;
    axios.get(url)
        .then(response => {
            console.log(response.data.friends);
            buildFriendsTable(response.data.friends);
        })
        .catch(error => {

        });
}

var friendRequestSubmit = function () {
    var resetErrors = function (element) {
        let elemErrorText = document.getElementById(element.id + "_error");
        if (elemErrorText) {
            elemErrorText.style.display = "none";
        }
    }
    var showError = function (elementId, message) {
        let errorText = document.getElementById(elementId);
        errorText.textContent = message;
        errorText.style.display = "block";
    }

    let requestButton = document.getElementById("request");
    let requestInput = document.getElementById("search-email");

    requestButton.addEventListener("click", function () {
        resetErrors("request");
        const url = `http://${window.location.host}/api/friends/add-friend`;
        axios.post(url, { email: requestInput.value })
            .then(response => {
                console.log(response);

            })
            .catch(error => {
                if (error.response.status === 400) {
                    error.response.data.errors.forEach(function (err) {
                        showError("request_error", err.msg);
                    });
                }
            });
    });

}

var buildAddFriendRequest = function () {
    let addFriendButton = document.getElementById("add-friends");
    addFriendButton.dataset.bsToggle = "modal";
    addFriendButton.dataset.bsTarget = "#modal-2";
}

var buildFriendsTable = function (friends) {

    var buildRow = function (friend) {
        let tr = document.createElement("tr");
        let friendName = document.createElement("td");
        let friendEmail = document.createElement("td");
        let friendLocation = document.createElement("td");
        let friendGender = document.createElement("td");
        let friendAction = document.createElement("td");
        let removeButton = document.createElement("button");

        friendName.textContent = friend.name;
        friendEmail.textContent = friend.email;
        friendLocation.textContent = friend.location;
        friendGender.textContent = friend.gender;
        friendAction.className = "text-end";
        removeButton.className = "btn btn-primary";
        removeButton.textContent = "Remove";
        removeButton.id = "remove-friend";

        removeButton.dataset.bsToggle = "modal";
        removeButton.dataset.bsTarget = "#modal-3";
        let removeConfirmation = document.getElementById("remove");
        removeConfirmation.addEventListener("click", function () {
            const url = `http://${window.location.host}/api/users/remove-friend`;
            axios.post(url, { key: headhunter.key })
                .then(response => {
                    window.location.reload();
                })
                .catch(error => {

                });
        });

        friendAction.appendChild(removeButton);
        tr.appendChild(friendName);
        tr.appendChild(friendEmail);
        tr.appendChild(friendLocation);
        tr.appendChild(friendGender);
        tr.appendChild(friendAction);

        return tr;
    }

    let friendsTable = document.getElementById("friends");

    let div = document.createElement("div");
    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let tr = document.createElement("tr");
    let friendName = document.createElement("th");
    let friendEmail = document.createElement("th");
    let friendLocation = document.createElement("th");
    let friendGender = document.createElement("th");
    let friendAction = document.createElement("th");

    div.className = "table-responsive";
    table.className = "table";
    friendName.textContent = "Name";
    friendEmail.textContent = "Email";
    friendLocation.textContent = "Location";
    friendGender.textContent = "Gender";
    friendAction.textContent = "Action";
    friendAction.className = "text-end";

    tr.appendChild(friendName);
    tr.appendChild(friendEmail);
    tr.appendChild(friendLocation);
    tr.appendChild(friendGender);
    tr.appendChild(friendAction);
    thead.appendChild(tr);
    table.appendChild(thead);

    friends.forEach(friend => table.appendChild(buildRow(friend)));

    div.appendChild(table);
    friendsTable.appendChild(div);
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

        dropdownDiv.appendChild(profileItem);
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