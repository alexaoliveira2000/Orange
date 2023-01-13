let checkAuthentication = function () {
    const url = `http://${window.location.host}/api/check-authentication`
    axios.get(url)
        .then(response => {
            init(response.data);
        })
        .catch(error => {

        });
}

let init = function(session) {
    let pathname = window.location.pathname,
        pathnameArray = pathname.split("/"),
        value = pathnameArray[pathnameArray.length - 1];
    
        console.log(value);

    if(value) {
        const url = `http://${window.location.host}/api/profile/${value}`
        axios.get(url)
        .then(response => {
            buildDOM(response.data);
            buildNavBar(session);
            buildLogoutEvent(session);
        })
        .catch(error => {

        });
    }

}

let buildNavBar = function (session) {

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
        profileItem.className = "dropdown-item";
        profileItem.href = "profile";
        profileItem.textContent = "Profile";
        friendsItem.className = "dropdown-item";
        friendsItem.href = "friends";
        friendsItem.textContent = "Friends";
        logoutItem.className = "dropdown-item";
        logoutItem.href = "#";
        logoutItem.dataset.bsToggle = "modal";
        logoutItem.dataset.bsTarget = "#modal-1";
        logoutItem.textContent = "Sign out";
        dividerDiv.className = "dropdown-divider";

        dropdownDiv.appendChild(profileItem);
        dropdownDiv.appendChild(friendsItem);
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

    console.log("USER: " + JSON.stringify(session.user));

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

let buildDOM = function(data) {

    let userData = data.user,
        coursesData = data.courses,
        workplacesData = data.workplaces,
        coursesList = document.getElementById("coursesList"),
        workplacesList = document.getElementById("workplacesList");

    document.getElementById("username").textContent = userData.name;
    document.getElementById("userDescription").textContent = userData.description;
    document.getElementById("userBirthDay").textContent = handleDates(userData.birthDate);
    document.getElementById("userGender").textContent = (userData.gender === "M") ? "Masculino" : "Feminino";
    document.getElementById("userLocation").textContent = userData.location;

    buildLists(coursesList, coursesData, true);
    buildLists(workplacesList, workplacesData, false);

}

let handleDates = function(dateString) {

    let dateArr = dateString.split("-");
    let year = dateArr[0];
    let month = dateArr[1].substring(0,2);
    let day = dateArr[2].substring(0,2);

    return day.concat("/",month,"/",year);
}

let buildLists = function(list, data, isCourse) {

    if(data.length === 0) {

        let mainDiv = document.createElement("div"),
            titleNoData = document.createElement("h1");

        mainDiv.className = "card"
        mainDiv.style = "margin-bottom:1.5%;"

        titleNoData.className = "text-center";
        titleNoData.style = "font-size: 30px;";

        mainDiv.appendChild(titleNoData);
        list.appendChild(mainDiv);

    } else {

        for(let i = 0; i < data.length; i++) {

            let mainDiv = document.createElement("div"),
                bodyDiv = document.createElement("div"),
                sectionTitle = document.createElement("section"),
                titleHeader = document.createElement("h4"),
                editIcon = document.createElement("i"),
                subtitleHeader = document.createElement("h6"),
                descriptionParagraph = document.createElement("p");

            mainDiv.className = "card"
            mainDiv.style = "margin-bottom:1.5%;"
    
            bodyDiv.className = "card-body";
    
            sectionTitle.className = "d-flex";
    
            titleHeader.className = "d-flex justify-content-start align-items-center";
            titleHeader.style = "width:50%;height:30px;";
    
            editIcon.className = "fas fa-edit d-flex justify-content-end align-items-center";
            editIcon.style = "width:50%;height:30px;font-size:24px;color:rgb(143,143,143);";
    
            subtitleHeader.className = "text-muted card-subtitle mb-2";
    
            descriptionParagraph.className = "card-text";
    
            if(isCourse) {
    
                titleHeader.textContent = data[i].name;
                subtitleHeader.textContent = data[i].schoolName;
                descriptionParagraph.textContent = "With an average grade of " + data[i].averageGrade;
    
            } else {
    
                titleHeader.textContent = data[i].name;
                subtitleHeader.textContent = handleDates(data[i].startDate) + " - " + handleDates(data[i].endDate);
                descriptionParagraph.textContent = data[i].functionDescription;
    
            }
    
            sectionTitle.appendChild(titleHeader);
            sectionTitle.appendChild(editIcon);
    
            bodyDiv.appendChild(sectionTitle);
            bodyDiv.appendChild(subtitleHeader);
            bodyDiv.appendChild(descriptionParagraph);
    
            mainDiv.appendChild(bodyDiv);

            list.appendChild(mainDiv);
        }

    }

}

window.onload = checkAuthentication;