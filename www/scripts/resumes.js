var resumes;

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
    const urlParams = new URLSearchParams(window.location.search);
    const obj = Object.fromEntries(new URLSearchParams(window.location.search))
    console.log(obj);
    //const myParam = urlParams.get('myParam');

    const url = `http://${window.location.host}/api/resumes`
    axios.get(url)
        .then(response => {
            console.log(response.data)
            //resumes = response.data.resumes;
            resumes = response.data.resumes.map(resume => ({
                ...resume,
                show: true
            }));
            const filters = [
                { property: "location", name: "Location" }
            ]
            createCheckboxFilter({ property: "location", name: "Location" }, "main-filters");
            createCheckboxFilter("location", "collapsed-filters");
            buildResumeCards(resumes);
        })
        .catch(error => {

        });
}

// FILTERS (MAIN & COLLAPSED)
var createCheckboxFilter = function (filter, filterId) {
    let values = [...new Set(resumes.map((resume) => resume[filter.property]))];
    values.sort(filter.name === "Duration" ? durationSort : undefined);
    let filtersDiv = document.getElementById(filterId);
    let filterItemDiv = document.createElement("div");
    filterItemDiv.className = "filter-item";
    let filterName = document.createElement("h3");
    filterName.textContent = filter.name;
    filterItemDiv.appendChild(filterName);
    values.forEach(function (value, index) {
        let id = `${filterId}-${filter.property}-${index}`;
        let filterInputDiv = document.createElement("div");
        filterInputDiv.className = "form-check";
        let filterInput = document.createElement("input");
        filterInput.className = "form-check-input";
        filterInput.type = "checkbox";
        filterInput.id = id;
        let filterLabel = document.createElement("label");
        filterLabel.className = "form-check-label";
        filterLabel.htmlFor = id;
        filterLabel.textContent = value;
        filterInputDiv.appendChild(filterInput);
        filterInputDiv.appendChild(filterLabel);
        filterItemDiv.appendChild(filterInputDiv);
        filtersDiv.appendChild(filterItemDiv);
    });
}

var buildResumeCards = function (resumes) {
    var calculateAge = function (birthdate) {

        var currentDate = new Date();
        var currentYear = currentDate.getFullYear();
        var currentMonth = currentDate.getMonth();
        var currentDay = currentDate.getDate();

        var birthdate = new Date(birthdate);
        var birthYear = birthdate.getFullYear();
        var birthMonth = birthdate.getMonth();
        var birthDay = birthdate.getDate();

        var age = currentYear - birthYear;
        if (currentMonth < birthMonth || (currentMonth == birthMonth && currentDay < birthDay)) {
            age--;
        }
        return age;
    }
    var buildResumeCard = function (resume) {
        let div = document.createElement("div");
        let cardDiv = document.createElement("div");
        let cardBodyDiv = document.createElement("div");
        let nameText = document.createElement("h5");
        let profileLink = document.createElement("a");
        let moreInfoDiv = document.createElement("div");
        let workplacesDiv = document.createElement("div");
        let workplacesIcon = document.createElement("i");
        let workplacesCounter = document.createElement("small");
        let coursesDiv = document.createElement("div");
        let coursesIcon = document.createElement("i");
        let coursesCounter = document.createElement("small");
        let cardBody2Div = document.createElement("div");
        let emailAddressTitle = document.createElement("small");
        let emailAddressValue = document.createElement("h6");
        let ageTitle = document.createElement("small");
        let ageValue = document.createElement("h6");
        let locationTitle = document.createElement("small");
        let locationValue = document.createElement("h6");

        div.className = "col-lg-4 col-xlg-3 col-md-5";
        div.style.marginBottom = "20px";
        cardDiv.className = "card";
        cardBodyDiv.className = "card-body";
        nameText.className = "text-center card-title m-t-10";
        profileLink.style.color = "rgb(255, 130, 3)";
        profileLink.href = `/profile?${resume.key}`,
            profileLink.textContent = resume.name;
        moreInfoDiv.className = "row text-center justify-content-md-center";
        moreInfoDiv.style.marginTop = "20px";
        workplacesDiv.className = "col-4";
        workplacesIcon.className = "fas fa-briefcase";
        workplacesIcon.style.marginRight = "10px";
        workplacesCounter.className = "font-medium";
        workplacesCounter.textContent = resume.workplacesCount;
        coursesDiv.className = "col-4";
        coursesIcon.className = "fas fa-medal";
        coursesIcon.style.marginRight = "10px";
        coursesCounter.className = "font-medium";
        coursesCounter.textContent = resume.coursesCount;
        cardBody2Div.className = "card-body";
        emailAddressTitle.className = "text-muted";
        emailAddressTitle.textContent = "Email address";
        emailAddressValue.textContent = resume.email;
        ageTitle.className = "text-muted p-t-30 db";
        ageTitle.textContent = "Age";
        ageValue.textContent = calculateAge(resume.birthDate);
        locationTitle.className = "text-muted p-t-30 db";
        locationTitle.textContent = "Location";
        locationValue.textContent = resume.location;

        cardBody2Div.appendChild(emailAddressTitle);
        cardBody2Div.appendChild(emailAddressValue);
        cardBody2Div.appendChild(ageTitle);
        cardBody2Div.appendChild(ageValue);
        cardBody2Div.appendChild(locationTitle);
        cardBody2Div.appendChild(locationValue);
        coursesDiv.appendChild(coursesIcon);
        coursesDiv.appendChild(coursesCounter);
        workplacesDiv.appendChild(workplacesIcon);
        workplacesDiv.appendChild(workplacesCounter);
        moreInfoDiv.appendChild(coursesDiv);
        moreInfoDiv.appendChild(workplacesDiv);
        nameText.appendChild(profileLink);
        cardBodyDiv.appendChild(nameText);
        cardBodyDiv.appendChild(moreInfoDiv);
        cardDiv.appendChild(cardBodyDiv);
        cardDiv.appendChild(cardBody2Div);
        div.appendChild(cardDiv);

        return div;
    }
    let resumeCards = document.getElementById("resumeCards");
    resumes.forEach(resume => resumeCards.appendChild(buildResumeCard(resume)));
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

window.onload = checkAuthentication;