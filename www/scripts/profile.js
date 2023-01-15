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
            //buildModalStructure();
            buildDOM(response.data);
            buildNavBar(session);
            buildLogoutEvent(session);
        })
        .catch(error => {
            console.log(error);
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
        //coursesData = data.courses,
        workplacesData = data.workplaces,
        coursesList = document.getElementById("coursesList"),
        workplacesList = document.getElementById("workplacesList");

    data.coursesOptions = enumStringToArray(data.coursesOptions);

    document.getElementById("username").textContent = userData.name;
    document.getElementById("userDescription").textContent = userData.description;
    document.getElementById("userBirthDay").textContent = handleDates(userData.birthDate);
    document.getElementById("userGender").textContent = (userData.gender === "M") ? "Masculino" : "Feminino";
    document.getElementById("userLocation").textContent = userData.location;

    document.getElementById("addCourse").onclick = function() { buildModalForm("C", undefined, data.coursesOptions); }
    document.getElementById("addWorkplace").onclick = function() { buildModalForm("W"); }

    buildLists(coursesList, data, true);
    buildLists(workplacesList, workplacesData, false);

}

let enumStringToArray = function(enumString) {

    enumString = enumString.replace("enum(", "").replace(")", "");

    let enumOptions = enumString.split(",");

    for(let i = 0; i < enumOptions.length; i++) {

        enumOptions[i] = formatCourseTypeValue(enumOptions[i], false);
    }

    return enumOptions;
}

let formatCourseTypeValue = function(value, isReverse) {

    if(isReverse) {
        value = value.toLowerCase();
        value = value.replace(/ /g, "_");
    } else {
        value = value.replace(/'/g, "");
        value = value.replace(/_/g, " ");
        value = value.replace(/\b[a-z]/g, function(letter) {
            return letter.toUpperCase();
        })
    }

    return value;

}

let handleDates = function(dateString) {

    let dateArr = dateString.split("-");
    let year = dateArr[0];
    let month = dateArr[1].substring(0,2);
    let day = dateArr[2].substring(0,2);

    return day.concat("/",month,"/",year);
}

let buildLists = function(list, data, isCourse) {

    let coursesOptions = (isCourse) ? data.coursesOptions : "";
        
    data = (isCourse) ? data.courses : data;

    if(data.length === 0) {

        let mainDiv = document.createElement("div"),
            titleNoData = document.createElement("h1");

        mainDiv.className = "card"
        mainDiv.style = "margin-bottom:1.5%;"

        titleNoData.className = "text-center";
        titleNoData.style = "font-size: 20px; margin:10px;";
        titleNoData.textContent = "Não foram encontrados dados";

        if(isCourse) {
            titleNoData.textContent = "The user has no associated courses";
        } else {
            titleNoData.textContent = "The user has no associated workplaces";
        }

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
            editIcon.setAttribute("data-bs-toggle", "modal");
            editIcon.setAttribute("data-bs-target", "#mainModal");
    
            subtitleHeader.className = "text-muted card-subtitle mb-2";
    
            descriptionParagraph.className = "card-text";
    
            if(isCourse) {
    
                titleHeader.textContent = data[i].name;
                subtitleHeader.textContent = data[i].schoolName;
                descriptionParagraph.textContent = "With an average grade of " + data[i].averageGrade;
                editIcon.onclick = function() { buildModalForm("C", data[i], coursesOptions); }
    
            } else {
    
                titleHeader.textContent = data[i].name;
                subtitleHeader.textContent = handleDates(data[i].startDate) + " - " + handleDates(data[i].endDate);
                descriptionParagraph.textContent = data[i].functionDescription;
                editIcon.onclick = function() { buildModalForm("W", data[i]); }
    
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

let buildModalForm = function(firstLetter, data, coursesOptions) {

    let modalBody = document.getElementById("bodyModal"),
        firstColumn = document.createElement("div"),
        secondColumn = document.createElement("div"),
        buttonSection = document.createElement("section"),
        deleteButton = document.createElement("button"),
        saveButton = document.createElement("button");

    while(modalBody.hasChildNodes()) {
        modalBody.removeChild(modalBody.firstChild);
    }
    
    modalBody.appendChild(firstColumn);
    modalBody.appendChild(secondColumn);

    firstColumn.className = "col-4 col-xl-3 d-block";
    firstColumn.style = "padding: 5px;";
    secondColumn.className = "col-3 col-xl-3 d-block";
    secondColumn.style = "padding: 5px;margin-left: 140px";

    buttonSection.className = "d-block float-end";
    buttonSection.style = "margin-top: 20px;"

    deleteButton.className = "btn btn-primary";
    deleteButton.style = "margin-right: 10px;background: #b10b00;border-style: none;"
    saveButton.className = "btn btn-primary";
    saveButton.style = "background: rgb(255,130,3);border-style: none;";

    buttonSection.appendChild(deleteButton);
    buttonSection.appendChild(saveButton);


    if(firstLetter === "C") {

        let nameSection = document.createElement("section"),
            nameLabel = document.createElement("label"),
            nameInput = document.createElement("input"),
            schoolSection = document.createElement("section"),
            schoolLabel = document.createElement("label"),
            schoolInput = document.createElement("input"),
            typeSection = document.createElement("section"),
            typeLabel = document.createElement("label"),
            typeSelect = document.createElement("select"),
            gradeSection = document.createElement("section"),
            gradeLabel = document.createElement("label"),
            gradeInput = document.createElement("input");
        
        document.getElementById("modalContent").style = "width: 470px;";
        
        nameSection.className = "d-block";
        nameSection.style = "margin-top: 10px;";

        nameLabel.className = "form-label";
        nameLabel.style = "margin-right: 78px;margin-bottom: 0px;";
        nameLabel.textContent = "Name";
        
        nameInput.required = true;

        schoolSection.className = "d-block";
        schoolSection.style = "margin-top: 10px;";

        schoolLabel.className = "form-label";
        schoolLabel.style = "margin-right: 20px;margin-bottom: 0px;width: 120px !important;";
        schoolLabel.textContent = "School Name";

        schoolInput.required = true;

        typeSection.className = "d-block";
        typeSection.style = "margin-top: 10px;";

        typeLabel.className = "form-label";
        typeLabel.style = "margin-right: 90px;margin-bottom: 0px;";
        typeLabel.textContent = "Type";

        typeSelect.required = true;

        for(let i = 0; i < coursesOptions.length; i++) {

            let option = document.createElement("option");

            option.text = coursesOptions[i];
            typeSelect.add(option);
        }

        gradeSection.className = "d-block";
        gradeSection.style = "margin-top: 10px;";

        gradeLabel.className = "form-label";
        gradeLabel.style = "margin-right: 10px;margin-bottom: 0px;width: 120px !important;";
        gradeLabel.textContent = "Average Grade";

        gradeInput.required = true;
        gradeInput.type ="number";
        gradeInput.className = "form-control-sm";
        gradeInput.style = "width: 70px;";
        gradeInput.max = 20;
        gradeInput.min = 0;

        if(data) {

            nameInput.value = data.name;
            schoolInput.value = data.schoolName;
            typeSelect.value = formatCourseTypeValue(data.type, false);
            gradeInput.value = data.averageGrade;
        
            document.getElementById("firstButtonModal").textContent = "Delete";
            document.getElementById("firstButtonModal").style = "background: #b10b00;border-color: #b10b00;color: rgb(255,255,255)";
            document.getElementById("secondButtonModal").textContent = "Save Changes";
            document.getElementById("secondButtonModal").style = "background: rgb(255,130,3);border-color: rgb(255,255,255);";
            document.getElementById("titleModal").textContent = "Edit Course";

        } else {

            document.getElementById("firstButtonModal").textContent = "Close";
            document.getElementById("firstButtonModal").style = "background: rgb(255,255,255);border-color: rgb(255,130,3);color: rgb(255,130,3)";
            document.getElementById("secondButtonModal").textContent = "Submit";
            document.getElementById("secondButtonModal").style = "background: rgb(255,130,3);border-color: rgb(255,130,3);";
            document.getElementById("titleModal").textContent = "Add Course";
        }

        nameSection.appendChild(nameLabel);
        nameSection.appendChild(nameInput);

        schoolSection.appendChild(schoolLabel);
        schoolSection.appendChild(schoolInput);

        typeSection.appendChild(typeLabel);
        typeSection.appendChild(typeSelect);

        gradeSection.appendChild(gradeLabel);
        gradeSection.appendChild(gradeInput);

        firstColumn.appendChild(nameSection);
        firstColumn.appendChild(schoolSection);

        secondColumn.appendChild(typeSection);
        secondColumn.appendChild(gradeSection);



    } else if(firstLetter === "W") {

        let nameSection = document.createElement("section"),
            nameLabel = document.createElement("label"),
            nameInput = document.createElement("input"),
            logoSection = document.createElement("section"),
            logoLabel = document.createElement("label"),
            logoInput = document.createElement("input"),
            startDateSection = document.createElement("section"),
            startDateLabel = document.createElement("label"),
            startDateInput = document.createElement("input"),
            endDateSection = document.createElement("section"),
            endDateLabel = document.createElement("label"),
            endDateInput = document.createElement("input"),
            functionSection = document.createElement("section"),
            functionLabel = document.createElement("label"),
            functionTextArea = document.createElement("textarea");
        
        document.getElementById("modalContent").style = "width: 540px;";
        
        nameSection.className = "d-block";
        nameSection.style = "margin-top: 10px;";

        nameLabel.className = "form-label";
        nameLabel.style = "margin-right: 78px;margin-bottom: 0px;";
        nameLabel.textContent = "Name";
        
        nameInput.required = true;

        logoSection.className = "d-block";
        logoSection.style = "margin-top: 10px;";

        logoLabel.className = "form-label";
        logoLabel.style = "margin-right: 20px;margin-bottom: 0px;";
        logoLabel.textContent = "Logo URL";

        logoInput.required = true;
        logoInput.type = "url";

        startDateSection.className = "d-block";
        startDateSection.style = "margin-top: 10px;";

        startDateLabel.className = "form-label";
        startDateLabel.style = "margin-right: 10px;margin-bottom: 0px;";
        startDateLabel.textContent = "Start Date";

        startDateInput.required = true;
        startDateInput.type ="date";

        endDateSection.className = "d-block";
        endDateSection.style = "margin-top: 10px;";

        endDateLabel.className = "form-label";
        endDateLabel.style = "margin-right: 10px;margin-bottom: 0px;";
        endDateLabel.textContent = "End Date";

        endDateInput.required = true;
        endDateInput.type ="date";

        functionSection.className = "d-block";
        functionSection.style = "margin-top: 10px;";

        functionLabel.className = "form-label";
        functionLabel.style = "margin-right: 20px;margin-bottom: 0px;width: 180px !important;";
        functionLabel.textContent = "Function Description";

        functionTextArea.required = true;
        functionTextArea.className ="form-control-lg";
        functionTextArea.style = "font-size: 16px;";

        if(data) {

            nameInput.value = data.name;
            logoInput.value = data.logoUrl;
            startDateInput.value = data.startDate;
            endDateInput.value = data.endDate;
            functionTextArea.value = data.functionDescription;
        
            document.getElementById("firstButtonModal").textContent = "Delete";
            document.getElementById("secondButtonModal").textContent = "Save Changes";
            document.getElementById("titleModal").textContent = "Edit Workplace";

        } else {

            document.getElementById("firstButtonModal").textContent = "Close";
            document.getElementById("secondButtonModal").textContent = "Submit";
            document.getElementById("titleModal").textContent = "Add Workplace";
        }

        nameSection.appendChild(nameLabel);
        nameSection.appendChild(nameInput);

        logoSection.appendChild(logoLabel);
        logoSection.appendChild(logoInput);

        startDateSection.appendChild(startDateLabel);
        startDateSection.appendChild(startDateInput);

        endDateSection.appendChild(endDateLabel);
        endDateSection.appendChild(endDateInput);

        functionSection.appendChild(functionLabel);
        functionSection.appendChild(functionTextArea);

        firstColumn.appendChild(nameSection);
        firstColumn.appendChild(logoSection);
        firstColumn.appendChild(startDateSection);
        firstColumn.appendChild(endDateSection);

        secondColumn.appendChild(functionSection);

    } else {



    }


}

let buildConfirmationModal = function(message) {

    let confirmationModalBody = document.getElementById("bodyConfirmationModal"),
        confirmationText = document.createElement("h2");

        while(confirmationModalBody.hasChildNodes()) {
            confirmationModalBody.removeChild(confirmationModalBody.firstChild);
        }

        confirmationText.textContent = message;

        confirmationModalBody.appendChild(confirmationText);


}

window.onload = checkAuthentication;