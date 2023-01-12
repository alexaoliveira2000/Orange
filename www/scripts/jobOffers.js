"use strict"

const MAX_COMPARE = 3;

var jobs;

let checkAuthentication = function () {
    const url = `http://${window.location.host}/api/check-authentication`;
    axios.get(url)
        .then(response => {
            init(response.data);
        })
        .catch(error => {

        });
}

let init = function (session) {
    buildNavBar(session);
    buildLogoutEvent(session);
    const url = `http://${window.location.host}/api/jobOffers`;
    // get all jobs from usersRoutes.js
    axios.get(url)
        .then(response => {
            jobs = response.data.map(job => ({
                ...job,
                creation_date: new Date(job.creation_date),
                until_date: new Date(job.until_date),
                show: true,
                compare: false
            }));
            const filters = [
                { property: "duration", name: "Duration" },
                { property: "area", name: "Area" },
                { property: "work_type", name: "Work Type" }
            ]

            const sorts = [
                { property: "creation_date", name: "Most Recent" },
                { property: "salary", name: "Highest Salary" },
                { property: "duration", name: "Most Duration" }
            ]

            const comparationTable = [
                { property: "salary", name: "Salary" },
                { property: "duration", name: "Duration" },
                { property: "area", name: "Area" },
                { property: "work_type", name: "Work Type" },
                { property: "until_date", name: "Valid Until" }
            ]

            const searchItems = ["title", "company", "description"];

            // create search bar
            createSearchBar(searchItems);

            // create sorts
            createSorts(sorts);

            // create both filters (main and collapsed filters)
            createFilters(filters, "main-filters");
            createFilters(filters, "collapsed-filters");

            // create job cards
            updateJobCards();

            // create comparation bar (initially empty)
            updateComparationBar(comparationTable);
        });
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
        logoutItem.dataset.bsTarget = "#modal-2";
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

// SEARCH BAR
var createSearchBar = function (searchItems) {
    var onSearch = function (value) {
        if (value) {
            jobs.forEach(job => job.show = false);
            let filteredJobs = [];
            searchItems.forEach(function (item) {
                let foundJobs = jobs.filter(job => job[item].toLowerCase().includes(value.toLowerCase()));
                filteredJobs.splice(filteredJobs.length, 0, ...foundJobs);
            });
            // remove duplicates
            filteredJobs = filteredJobs.filter((element, index) => {
                return filteredJobs.indexOf(element) === index;
            });
            jobs.forEach(function (job) {
                let tempJob = filteredJobs.filter(obj => obj._id === job._id);
                job.show = tempJob.length !== 0;
            });
            updateJobCards();
        } else {
            jobs.forEach(job => job.show = true);
            updateJobCards();
        }
    }

    let searchBar = document.getElementById("search-bar");
    let searchButton = document.getElementById("search-button");
    searchBar.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            onSearch(searchBar.value);
        }
    });
    searchButton.addEventListener("click", function () {
        onSearch(searchBar.value);
    })
}

// SORTS
var createSorts = function (sorts) {
    var sortJobs = function (sort) {
        var durationSort = function (job1, job2) {
            parseInt(job1[sort.property]) > parseInt(job2[sort.property]) ? -1 : 1;
        }
        var defaultSort = function (job1, job2) {
            return job1[sort.property] > job2[sort.property] ? -1 : 1;
        }
        jobs.sort(sort.name === "Most Duration" ? durationSort : defaultSort);
    }

    var onSortChange = function (sort) {
        let sortValue = document.getElementById("sort-value");
        sortValue.textContent = sort.name;
        sortJobs(sort);
        updateJobCards();
    }

    // change dropdown name
    let sortValue = document.getElementById("sort-value");
    sortValue.textContent = sorts[0].name;
    // create dropdown items (buttons)
    let sortsDropdown = document.getElementById("sorts");
    sorts.forEach(function (sort) {
        let button = document.createElement("button");
        button.type = "button";
        button.className = "dropdown-item";
        button.style.zIndex = "999;"
        button.textContent = sort.name;
        sortsDropdown.appendChild(button);
        button.addEventListener("click", function () {
            onSortChange(sort);
        });
    });
    // sort jobs by initial sort (most recent)
    sortJobs(sorts[0]);
}

// FILTERS (MAIN & COLLAPSED)
var createFilters = function (filters, filterId) {
    var durationSort = function (value1, value2) {
        return parseInt(value1) > parseInt(value2) ? 1 : -1;
    }

    var onFilterChange = function (filterInput) {

        jobs.forEach(job => job.show = false);

        var pairedFilterId = filterId === "main-filters" ? "collapsed-filters" : "main-filters";

        // change paired filter (if the main filter is changed, the collapsed one also changes, and vice-versa)
        let pairedFilter = document.getElementById(filterInput.id.replace(filterId, pairedFilterId));
        pairedFilter.checked = filterInput.checked;

        let tempJobs = Object.create(jobs);
        let selectedJobs = [];
        filters.forEach(function (filter) {
            let filterItems = document.querySelectorAll(`[id^="${filterId}-${filter.property}-"]`);
            let checkedItems = [...new Set(Array.from(filterItems).filter(item => item.checked))];
            checkedItems.forEach(function (item) {
                let value = document.querySelector(`[for^="${item.id}"]`);
                let filteredJobs = tempJobs.filter(job => job[filter.property] === value.textContent);
                selectedJobs.splice(selectedJobs.length, 0, ...filteredJobs);
            });
        });
        if (selectedJobs.length === 0) {
            selectedJobs = jobs;
        } else {
            // remove duplicates
            selectedJobs = selectedJobs.filter((element, index) => {
                return selectedJobs.indexOf(element) === index;
            });
        }
        jobs.forEach(function (job) {
            let tempJob = selectedJobs.filter(obj => obj._id === job._id);
            job.show = tempJob.length !== 0;
        });
        updateJobCards();
    }

    filters.forEach(function (filter) {
        let values = [...new Set(jobs.map((job) => job[filter.property]))];
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
            filterInputDiv.addEventListener("click", function () {
                onFilterChange(filterInput);
            });
            filtersDiv.appendChild(filterItemDiv);
        });
    });
}

// JOB CARDS
var updateJobCards = function () {
    var calculateDays = function (date) {
        let time = (new Date()).getTime() - date.getTime();
        return (time / (1000 * 3600 * 24)).toFixed(0);
    }

    clearElementChildren("jobs");
    let selectedJobs = jobs.filter(job => job.show);

    // change "search results" info
    let searchResults = document.getElementById("search-results");
    searchResults.textContent = `Search results: ${selectedJobs.length}`;

    let comparationJobsNumber = jobs.filter(job => job.compare).length;

    let jobsDiv = document.getElementById("jobs");

    // create job cards
    selectedJobs.forEach(function (job, index, arr) {
        let isLastJob = index === arr.length - 1;
        // General div's
        let cardDiv = document.createElement("div");
        let cardBodyDiv = document.createElement("div");
        cardDiv.className = "card";
        if (!isLastJob) cardDiv.style.marginBottom = "10px";
        cardBodyDiv.className = "card-body";

        // Company name & Creation date
        let cardHeadDiv = document.createElement("div");
        let creationDate = document.createElement("h6");
        let companyName = document.createElement("h6");
        cardHeadDiv.style.marginBottom = "8px";
        cardHeadDiv.style.height = "20px";
        creationDate.className = "text-muted float-end mb-2";
        companyName.className = "text-muted float-start mb-2";
        creationDate.textContent = `${calculateDays(job.creation_date)} days ago`;
        companyName.textContent = `${job.company}`;
        cardHeadDiv.appendChild(creationDate);
        cardHeadDiv.appendChild(companyName);

        // Job title
        let title = document.createElement("h5");
        title.className = "d-flex justify-content-start card-title";
        title.style.width = "100%";
        title.style.fontWeight = "bold";
        title.textContent = `${job.title}`;

        let infoDiv = document.createElement("div");
        infoDiv.className = "d-flex";
        infoDiv.style.height = "30px";
        infoDiv.style.marginBottom = "8px";

        // Salary
        let salaryDiv = document.createElement("div");
        let salaryImage = document.createElement("img");
        let salaryInfo = document.createElement("small");
        salaryDiv.className = "align-self-center";
        salaryImage.width = 30;
        salaryImage.height = 30;
        salaryImage.src = "images/salary.png";
        salaryInfo.style.fontWeight = "bold";
        salaryInfo.textContent = `€${job.salary}/year`
        salaryDiv.appendChild(salaryImage);
        salaryDiv.appendChild(salaryInfo);

        // Duration
        let durationDiv = document.createElement("div");
        let durationImage = document.createElement("img");
        let durationInfo = document.createElement("small");
        durationDiv.className = "align-self-center";
        durationImage.width = 30;
        durationImage.height = 30;
        durationImage.src = "images/duration.png";
        durationInfo.style.fontWeight = "bold";
        durationInfo.textContent = job.duration;
        durationDiv.style.marginLeft = "10px";
        durationDiv.appendChild(durationImage);
        durationDiv.appendChild(durationInfo);

        // Valid until
        let validUntilDiv = document.createElement("div");
        let validUntilImage = document.createElement("img");
        let validUntilInfo = document.createElement("small");
        validUntilDiv.className = "align-self-center";
        validUntilImage.width = 30;
        validUntilImage.height = 30;
        validUntilImage.src = "images/until.png";
        validUntilInfo.style.fontWeight = "bold";
        validUntilInfo.textContent = `Valid until ${formatDate(job.until_date)}`
        validUntilDiv.style.marginLeft = "10px";
        validUntilDiv.appendChild(validUntilImage);
        validUntilDiv.appendChild(validUntilInfo);

        infoDiv.appendChild(salaryDiv);
        infoDiv.appendChild(durationDiv);
        infoDiv.appendChild(validUntilDiv);

        // Description
        let description = document.createElement("p");
        description.className = "card-text";
        description.textContent = job.description;

        // Compare checkbox
        let compareDiv = document.createElement("div");
        compareDiv.className = "form-check d-flex justify-content-end";
        let compareInput = document.createElement("input");
        compareInput.id = `compare-checkbox-${index + 1}`;
        compareInput.className = "form-check-input";
        compareInput.type = "checkbox";
        compareInput.checked = job.compare;
        if (!job.compare && comparationJobsNumber === MAX_COMPARE) {
            compareInput.disabled = true;
        }
        let compareLabel = document.createElement("label");
        compareLabel.className = "form-check-label";
        compareLabel.htmlFor = `compare-checkbox-${index + 1}`;
        compareLabel.style.marginLeft = "5px";
        compareLabel.textContent = "Compare";
        compareDiv.appendChild(compareInput);
        compareDiv.appendChild(compareLabel);
        compareInput.addEventListener("click", function () {
            job.compare = !job.compare;
            updateComparationBar();
            updateJobCards();
        })

        cardBodyDiv.appendChild(cardHeadDiv);
        cardBodyDiv.appendChild(title);
        cardBodyDiv.appendChild(infoDiv);
        cardBodyDiv.appendChild(description);
        cardBodyDiv.appendChild(compareDiv);
        cardDiv.appendChild(cardBodyDiv);
        jobsDiv.appendChild(cardDiv);
    });

    if (selectedJobs.length === 0) {
        let imageDiv = document.createElement("div");
        imageDiv.id = "no-results";
        imageDiv.className = "text-center d-flex justify-content-center align-items-center";
        let image = document.createElement("img");
        image.id = "no-results-image";
        image.src = "images/sadorange.png";
        imageDiv.appendChild(image);

        let textDiv = document.createElement("div");
        textDiv.className = "text-center d-flex justify-content-center align-items-center";
        let text = document.createElement("h2");
        text.id = "no-results-text";
        text.className = "text-info";
        text.textContent = "No results found";
        textDiv.appendChild(text);

        jobsDiv.appendChild(imageDiv);
        jobsDiv.appendChild(textDiv);
    }

}

// COMPARATION BAR
var updateComparationBar = function (comparationTable) {
    var createComparationTable = function (comparationTable) {
        clearElementChildren("compare-table");
        let comparationJobs = jobs.filter(job => job.compare);
        let table = document.getElementById("compare-table");

        // headers
        let head = document.createElement("thead");
        let headerRow = document.createElement("tr");
        let emptyHeader = document.createElement("th");
        //emptyHeader.textContent = "<th><br /></th>";
        let thHeader = document.createElement("th");
        thHeader.appendChild(document.createElement("br"));
        emptyHeader.appendChild(thHeader);


        headerRow.appendChild(emptyHeader);
        comparationJobs.forEach(function (job) {
            let header = document.createElement("th");
            header.className = "text-nowrap";
            //header.textContent = `<br /><strong>${job.title},<br />${job.company}</strong><br /><br />`;

            header.appendChild(document.createElement("br"));
            let strongHeader = document.createElement("strong");
            strongHeader.textContent = `${job.title},`;
            header.appendChild(strongHeader);
            header.appendChild(document.createElement("br"));
            strongHeader = document.createElement("strong");
            strongHeader.textContent = `${job.company}`;
            header.appendChild(strongHeader);
            header.appendChild(document.createElement("br"));
            header.appendChild(document.createElement("br"));

            headerRow.appendChild(header);
        });
        head.appendChild(headerRow);

        // rows
        let body = document.createElement("tbody");
        comparationTable.forEach(function (comparation) {
            let row = document.createElement("tr");
            let compareText = document.createElement("td");
            compareText.className = "text-nowrap";
            compareText.style.fontWeight = "bold";
            compareText.textContent = comparation.name;
            row.appendChild(compareText);
            comparationJobs.forEach(function (job) {
                let value = document.createElement("td");
                value.className = "text-nowrap";
                switch (comparation.name) {
                    case "Valid Until":
                        value.textContent = formatDate(job[comparation.property]);
                        break;
                    case "Salary":
                        value.textContent = `€${job[comparation.property]}/year`;
                        break;
                    default:
                        value.textContent = job[comparation.property];
                }
                row.appendChild(value);
            });
            body.appendChild(row);
        });
        table.appendChild(head);
        table.appendChild(body);
    }

    clearElementChildren("compare-jobs", "DIV");
    let comparationJobs = jobs.filter(job => job.compare);

    let compareJobs = document.getElementById("compare-jobs");
    let compareButton = document.getElementById("compare-button");

    if (comparationTable) {
        let compareArrow = document.getElementById("compare-arrow");
        compareArrow.addEventListener("click", function () {
            compareArrow.src = compareArrow.ariaExpanded === "false" ? "images/arrow_up.png" : "images/arrow_down.png";
        });
        compareButton.addEventListener("click", function () {
            createComparationTable(comparationTable);
        });
    }

    let numSelectedJobs = document.getElementById("num-selected-jobs");
    numSelectedJobs.textContent = `${comparationJobs.length} Selected Jobs`

    if (comparationJobs.length < 2) {
        compareButton.disabled = true;
    } else {
        compareButton.disabled = false;
    }

    for (let i = 0; i < MAX_COMPARE; i++) {
        let columnDiv = document.createElement("div");
        columnDiv.className = "col item";
        let infoDiv = document.createElement("div");
        infoDiv.className = "py-4";
        if (comparationJobs[i]) {
            let title = document.createElement("h6");
            let salary = document.createElement("p");
            salary.style.marginBottom = "0px";
            title.textContent = `${comparationJobs[i].title}, ${comparationJobs[i].company}`
            salary.textContent = `€${comparationJobs[i].salary}/year`

            infoDiv.appendChild(title);
            infoDiv.appendChild(salary);
            columnDiv.appendChild(infoDiv);
        } else {
            let availableSpotText = document.createElement("small");
            availableSpotText.style.fontSize = "16px";
            availableSpotText.textContent = "Choose 1";
            infoDiv.appendChild(availableSpotText);
            infoDiv.appendChild(document.createElement("br"));
            let availableSpotText2 = document.createElement("small");
            availableSpotText2.style.fontSize = "16px";
            availableSpotText2.textContent = "more job";
            infoDiv.appendChild(availableSpotText2);
            columnDiv.appendChild(infoDiv);
        }
        compareJobs.appendChild(columnDiv);
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

var formatDate = function (date) {
    var padTo2Digits = function (num) {
        return num.toString().padStart(2, '0');
    }
    return [
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getMonth() + 1),
        date.getFullYear(),
    ].join('-');
}

window.onload = checkAuthentication;