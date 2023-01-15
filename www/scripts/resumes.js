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
    
    // FILTERS (MAIN & COLLAPSED)
    var createCheckboxFilter = function (filter, filterId, resumes) {
    
        var onFilterChange = function (filterInput) {
            let pairedFilterId = filterId === "main-filters" ? "collapsed-filters" : "main-filters";
            let pairedFilter = document.getElementById(filterInput.id.replace(filterId, pairedFilterId));
            pairedFilter.checked = filterInput.checked;
        }
    
        let values = [...new Set(resumes.map((resume) => resume[filter.property]))];
        values.sort();
        let filtersDiv = document.getElementById(filterId);
        let filterItemDiv = document.createElement("div");
        filterItemDiv.className = "filter-item";
        filterItemDiv.id = `${filterId}-${filter.property}`;
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
    
            filterInputDiv.addEventListener("click", function () {
                onFilterChange(filterInput);
                onChangeApplyButton();
            });
        });
    }

    console.log(session.authenticated)
    buildNavBar(session);
    buildLogoutEvent(session);
    console.log(window.location.search);
    
    let url = `http://${window.location.host}/api/resumes`;
    axios.get(url)
        .then(response => {
            console.log(response.data)
            let resumes = response.data.resumes;
            createApplyButton("main-filters");
            createAgeFilter("main-filters");
            createCheckboxFilter({ property: "location", name: "Location" }, "main-filters", resumes);

            createApplyButton("collapsed-filters");
            createAgeFilter("collapsed-filters");
            createCheckboxFilter({ property: "location", name: "Location" }, "collapsed-filters", resumes);

            if (window.location.search) {
                url += window.location.search;
            }
            axios.get(url)
                .then(response => {
                    buildResumeCards(response.data.resumes);
                }).catch(error => {

                });
        })
        .catch(error => {

        });
}

var createApplyButton = function (filterId) {

    var buildQueryString = function () {
        let mainLocationFilter = document.getElementById("main-filters-location");
        let mainLocationFilters = Array.from(mainLocationFilter.querySelectorAll('div input'));
        let minAge = document.getElementById("min-age-main-filters");
        let maxAge = document.getElementById("max-age-main-filters");
        let isFirst = true;

        let query = "?";
        if (minAge.value) {
            query += "minAge=" + minAge.value;
            isFirst = false;
        }
        if (maxAge.value) {
            if (!isFirst) query += "&"
            else isFirst = false;
            query += "maxAge=" + maxAge.value;
        }
        mainLocationFilters.forEach(function (option) {
            if (option.checked) {
                if (!isFirst) query += "&"
                else isFirst = false;
                query += "location=" + option.nextSibling.textContent.replaceAll(" ", "%20");
            }
        });
        return query;
    }

    let filtersDiv = document.getElementById(filterId);

    let filterItemDiv = document.createElement("div");
    filterItemDiv.className = "filter-item";

    let button = document.createElement("button");
    button.className = "btn btn-primary";
    button.type = "button";
    //button.disabled = true;
    button.id = `apply-button-${filterId}`;
    button.textContent = "Apply";

    filterItemDiv.appendChild(button);
    filtersDiv.appendChild(filterItemDiv);

    button.addEventListener("click", function () {
        let queryString = buildQueryString();
        console.log(queryString)
        window.history.replaceState('', '', queryString);
        const url = `http://${window.location.host}/api/resumes${queryString}`
        axios.get(url)
            .then(response => {
                clearElementChildren("resumeCards");
                buildResumeCards(response.data.resumes);
            })
            .catch(error => {
            });
    });


}

var createAgeFilter = function (filterId) {
    
    var onFilterChange = function (filterId) {

        let minAgeInput = document.getElementById(`min-age-${filterId}`);
        let maxAgeInput = document.getElementById(`max-age-${filterId}`);

        let pairedFilterId = filterId === "main-filters" ? "collapsed-filters" : "main-filters";
        let pairedMinAgeInput = document.getElementById(minAgeInput.id.replace(filterId, pairedFilterId));
        let pairedMaxAgeInput = document.getElementById(maxAgeInput.id.replace(filterId, pairedFilterId));

        pairedMinAgeInput.value = minAgeInput.value;
        pairedMaxAgeInput.value = maxAgeInput.value;
    }

    let filtersDiv = document.getElementById(filterId);

    let filterItemDiv = document.createElement("div");
    filterItemDiv.className = "filter-item";
    let filterName = document.createElement("h3");
    filterName.textContent = "Age";

    let div = document.createElement("div");
    let inputMin = document.createElement("input");
    let strong = document.createElement("strong");
    let inputMax = document.createElement("input");

    div.className = "d-flex";
    inputMin.type = "number";
    inputMin.style.width = "60px";
    inputMin.placeholder = "Min";
    inputMin.id = `min-age-${filterId}`;
    inputMin.min = "18";
    inputMin.max = "65";
    strong.className = "d-xl-flex align-items-xl-center";
    strong.textContent = "-";
    strong.style.marginLeft = "5px";
    strong.style.marginRight = "5px";
    inputMax.type = "number";
    inputMax.style.width = "60px";
    inputMax.placeholder = "Max";
    inputMax.id = `max-age-${filterId}`;
    inputMax.min = "18";
    inputMax.max = "65";

    inputMin.addEventListener("input", function () {
        onFilterChange(filterId);
        onChangeApplyButton();
    });
    inputMax.addEventListener("input", function () {
        onFilterChange(filterId);
        onChangeApplyButton();
    });

    div.appendChild(inputMin);
    div.appendChild(strong);
    div.appendChild(inputMax);
    filterItemDiv.appendChild(filterName);
    filterItemDiv.appendChild(div);

    filtersDiv.appendChild(filterItemDiv);
}

var onChangeApplyButton = function () {

    let applyButtonMain = document.getElementById("apply-button-main-filters");
    let applyButtonCollapsed = document.getElementById("apply-button-collapsed-filters");
    let minAge = document.getElementById("min-age-main-filters");
    let maxAge = document.getElementById("max-age-main-filters");
    let mainLocationFilter = document.getElementById("main-filters-location");
    let mainLocationFilters = Array.from(mainLocationFilter.querySelectorAll('div input'));
    let locationSelected = mainLocationFilters.some(filter => filter.checked);

    if (minAge.value > maxAge.value) {
        applyButtonMain.disabled = true;
    } else if (locationSelected) {
        applyButtonMain.disabled = false;
    } else if (minAge.value < 18 || maxAge.value < 18 || minAge.value > 65 || maxAge.value > 65) {
        applyButtonMain.disabled = true;
    } else if (!minAge.value && !maxAge.value && !locationSelected) {
        applyButtonMain.disabled = false;
    } else {
        applyButtonMain.disabled = false;
    }

    applyButtonCollapsed.disabled = applyButtonMain.disabled;

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
        div.style.marginTop = "10px";
        div.style.marginBottom = "10px";
        cardDiv.className = "card";
        cardBodyDiv.className = "card-body";
        nameText.className = "text-center card-title m-t-10";
        profileLink.style.color = "rgb(255, 130, 3)";
        profileLink.href = `/profile/${resume.key}`;
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
    if (resumes.length === 0) {
        let imageDiv = document.createElement("div");
        imageDiv.id = "no-results";
        imageDiv.className = "text-center d-flex justify-content-center align-items-center";
        let image = document.createElement("img");
        image.id = "no-results-image";
        image.src = "images/sadorange.png";

        let textDiv = document.createElement("div");
        textDiv.className = "text-center d-flex justify-content-center align-items-center";
        let text = document.createElement("h2");
        text.id = "no-results-text";
        text.className = "text-info";
        text.textContent = "No results found";

        imageDiv.appendChild(image);
        textDiv.appendChild(text);
        resumeCards.appendChild(imageDiv);
        resumeCards.appendChild(textDiv);
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