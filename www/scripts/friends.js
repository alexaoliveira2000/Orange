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
    friendRequestSubmit();

    let pathname = window.location.pathname;
    let pathnameArray = pathname.split("/");
    let value = pathnameArray[pathnameArray.length - 1];
    const url = `http://${window.location.host}/api/friends/${value}`;
    axios.get(url)
        .then(response => {
            console.log(response.data.friends);
            let friends = response.data.friends.filter(friend => !friend.pending);
            let pendingRequests = response.data.friends.filter(friend => friend.pending);
            buildFriendsTable(friends);
            buildPendingRequestsTable(pendingRequests);
            buildModalRequests(pendingRequests);
        })
        .catch(error => {

        });
}

var friendRequestSubmit = function () {
    var resetErrors = function (element) {
        let elemErrorText = document.getElementById(element.id + "_info");
        if (elemErrorText) {
            elemErrorText.style.display = "none";
        }
    }
    var showError = function (elementId, message) {
        let errorText = document.getElementById(elementId);
        errorText.textContent = message;
        errorText.style.display = "block";
        errorText.style = "color: var(--bs-red);"
    }
    var showSuccess = function (elementId, message) {
        let successText = document.getElementById(elementId);
        successText.textContent = message;
        successText.style.display = "block";
        successText.style = "color: var(--bs-green);"
    }

    let requestButton = document.getElementById("request");
    let requestInput = document.getElementById("search-email");

    requestButton.addEventListener("click", function () {
        resetErrors("request");
        const url = `http://${window.location.host}/api/friends/add-friend`;
        axios.post(url, { email: requestInput.value })
            .then(response => {
                showSuccess("request_info", "Friend request was sent!");
            })
            .catch(error => {
                if (error.response.status === 400) {
                    error.response.data.errors.forEach(function (err) {
                        showError("request_info", err.msg);
                    });
                }
            });
    });

}

var buildModalRequests = function (pendingRequests) {
    let addFriendButton = document.getElementById("add-friends");
    addFriendButton.dataset.bsToggle = "modal";
    addFriendButton.dataset.bsTarget = "#modal-2";

    let friendRequestsButton = document.getElementById("friend-requests");
    friendRequestsButton.dataset.bsToggle = "modal";
    friendRequestsButton.dataset.bsTarget = "#modal-4";

    if (pendingRequests.length !== 0) {
        friendRequestsButton.disabled = false;
    }
}

var buildFriendsTable = function (friends) {
    var buildRow = function (friend) {
        let tr = document.createElement("tr");
        let friendName = document.createElement("td");
        let friendProfile = document.createElement("a");
        let friendEmail = document.createElement("td");
        let friendLocation = document.createElement("td");
        let friendGender = document.createElement("td");
        let friendAction = document.createElement("td");
        let removeButton = document.createElement("button");

        //friendName.textContent = friend.name;
        friendProfile.href = `../profile/${friend.key}`;
        friendProfile.textContent = friend.name;
        friendProfile.style.color = "black";
        //friendProfile.style.textDecoration = "none";
        //friendProfile.style.fontWeight = "bold";
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

        removeButton.onclick = function () {
            removeConfirmation.onclick = function () {
                const url = `http://${window.location.host}/api/friends/remove-friend`;
                axios.post(url, { friendKey: friend.key })
                    .then(response => {
                        window.location.reload();
                    })
                    .catch(error => {

                    });
            }
        }
        /* removeConfirmation.addEventListener("click", function () {
            const url = `http://${window.location.host}/api/friends/remove-friend`;
            axios.post(url, { friendKey: friend.key })
                .then(response => {
                    window.location.reload();
                })
                .catch(error => {

                });
        }); */

        friendAction.appendChild(removeButton);
        friendName.appendChild(friendProfile);
        tr.appendChild(friendName);
        tr.appendChild(friendEmail);
        tr.appendChild(friendLocation);
        tr.appendChild(friendGender);
        tr.appendChild(friendAction);

        return tr;
    }

    let friendsTable = document.getElementById("friends");

    if (friends.length !== 0) {
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

        //friends.forEach(friend => table.appendChild(buildRow(friend)));
        friends.forEach(function (friend) {
            console.log(friend)
            if (!friend.pending) {
                table.appendChild(buildRow(friend));
            }
        });

        div.appendChild(table);
        friendsTable.appendChild(div);
    } else {
        let text = document.createElement("h4");
        text.textContent = "It seems you haven't connected to anyone yet...";

        friendsTable.appendChild(document.createElement("br"));
        friendsTable.appendChild(text);
        friendsTable.appendChild(document.createElement("br"));
    }

}

var buildPendingRequestsTable = function (friends) {
    var buildRow = function (friend) {
        let tr = document.createElement("tr");
        let friendName = document.createElement("td");
        let friendProfile = document.createElement("a");
        let friendAction = document.createElement("td");
        let acceptButton = document.createElement("button");
        let rejectButton = document.createElement("button");

        //friendName.textContent = friend.name;
        friendProfile.href = `../profile/${friend.key}`;
        friendProfile.textContent = friend.name;
        friendProfile.style.color = "black";
        //friendProfile.style.textDecoration = "none";
        //friendProfile.style.fontWeight = "bold";
        friendAction.className = "text-end";
        acceptButton.className = "btn btn-primary";
        acceptButton.textContent = "Accept";
        acceptButton.id = "accept-friend";
        rejectButton.className = "btn btn-primary";
        rejectButton.textContent = "Reject";
        rejectButton.id = "reject-friend";

        acceptButton.addEventListener("click", function () {
            const url = `http://${window.location.host}/api/friends/accept-friend`;
            axios.post(url, { friendKey: friend.key })
                .then(response => {
                    window.location.reload();
                })
                .catch(error => {

                });
        });

        rejectButton.addEventListener("click", function () {
            const url = `http://${window.location.host}/api/friends/remove-friend`;
            axios.post(url, { friendKey: friend.key })
                .then(response => {
                    window.location.reload();
                })
                .catch(error => {

                });
        });

        friendAction.appendChild(acceptButton);
        friendAction.appendChild(rejectButton);
        friendName.appendChild(friendProfile);
        tr.appendChild(friendName);
        tr.appendChild(friendAction);

        return tr;
    }

    let friendsTable = document.getElementById("requests-table");

    let div = document.createElement("div");
    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let tr = document.createElement("tr");
    let friendName = document.createElement("th");
    let friendAction = document.createElement("th");

    div.className = "table-responsive";
    table.className = "table";
    friendName.textContent = "Name";
    friendAction.textContent = "Action";
    friendAction.className = "text-end";

    tr.appendChild(friendName);
    tr.appendChild(friendAction);
    thead.appendChild(tr);
    table.appendChild(thead);

    friends.forEach(function (friend) {
        console.log(friend)
        if (friend.pending) {
            table.appendChild(buildRow(friend));
        }
    });

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

var clearElementChildren = function (elementId, elementType) {
    let element = document.getElementById(elementId);
    let node = element.firstChild;
    while (node) {
        let tempNode = node.nextSibling;
        if (!elementType || node.tagName === elementType) {
            element.removeChild(node);
        }
        node = tempNode;
    }
}

window.onload = checkAuthentication;