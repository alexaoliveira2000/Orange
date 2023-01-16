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
            buildDOM(response.data, session);
            buildNavBar(session);
        })
        .catch(error => {
            console.log(error);
        });
    }

}

let buildNavBar = function (session) {

    let actionDiv = document.getElementById("actionDiv");

    while(actionDiv.hasChildNodes()) {
        actionDiv.removeChild(actionDiv.firstChild);
    }

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
        logoutItem.onclick = function() { 
            document.getElementById("logout").onclick = function() {buildLogoutEvent(session);};
            document.getElementById("titleConfirmation").textContent = "Are you sure you want to sign out?";
        }
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
        const url = `http://${window.location.host}/api/logout`
        axios.post(url)
            .then(response => {
                window.location.href = `http://${window.location.host}/login?userLogout`;
            })
            .catch(error => {
                window.location.href = `http://${window.location.host}/`
            });
    }
}

let buildDOM = function(data, session) {

    let userData = data.user,
        coursesList = document.getElementById("coursesList"),
        workplacesList = document.getElementById("workplacesList"),
        isCurrentUserProfile = (data.user.id === session.user.id);

    data.coursesOptions = enumStringToArray(data.coursesOptions);

    document.getElementById("username").textContent = userData.name;
    document.getElementById("userDescription").textContent = userData.description;
    document.getElementById("userBirthDay").textContent = handleDates(userData.birthDate, false);
    document.getElementById("userGender").textContent = (userData.gender === "M") ? "Masculino" : "Feminino";
    document.getElementById("userLocation").textContent = userData.location;
    document.getElementById("userEmail").textContent = userData.email;

    document.getElementById("userEdit").onclick = function() { buildModalForm("User", data.user, undefined, session) };
    document.getElementById("addCourse").onclick = function() { buildModalForm("Course", undefined, data.coursesOptions, session); }
    document.getElementById("addWorkplace").onclick = function() { buildModalForm("Workplace", undefined, undefined, session); }

    if(isCurrentUserProfile) {

        document.getElementById("userEdit").style.display = "flex";
        document.getElementById("addCourse").style.display = "flex";
        document.getElementById("addWorkplace").style.display = "flex";

    }

    buildLists(coursesList, data, true, session);
    buildLists(workplacesList, data, false, session);

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

let handleDates = function(dateString, isForm) {

    let dateArr = dateString.split("-");
    let year = dateArr[0];
    let month = dateArr[1].substring(0,2);
    let day = dateArr[2].substring(0,2);

    return (!isForm) ? day.concat("/",month,"/",year) : month.concat("/",day,"/",year);
}

let buildLists = function(list, data, isCourse, session) {

    let coursesOptions = (isCourse) ? data.coursesOptions : "",
        isCurrentUserProfile = (data.user.id === session.user.id);
        
    data = (isCourse) ? data.courses : data.workplaces;

    while(list.childNodes.length > 3) {
        list.removeChild(list.lastChild);
    }

    if(data.length === 0) {

        let mainDiv = document.createElement("div"),
            titleNoData = document.createElement("h1");

        mainDiv.className = "card"
        mainDiv.style = "margin-bottom:1.5%;"

        titleNoData.className = "text-center";
        titleNoData.style = "font-size: 20px; margin:10px;";

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
                subtitleHeader = document.createElement("h6"),
                descriptionParagraph = document.createElement("p");

            mainDiv.className = "card"
            mainDiv.style = "margin-bottom:1.5%;"
    
            bodyDiv.className = "card-body";
    
            sectionTitle.className = "d-flex";
    
            titleHeader.className = "d-flex justify-content-start align-items-center";
            titleHeader.style = "width:90%;height:30px;";
    
            subtitleHeader.className = "text-muted card-subtitle mb-2";
    
            descriptionParagraph.className = "card-text";
            titleHeader.textContent = data[i].name;
            subtitleHeader.textContent = (isCourse) ? data[i].schoolName : handleDates(data[i].startDate, false) + " - " + handleDates(data[i].endDate, false);
            descriptionParagraph.textContent = (isCourse) ? ("With an average grade of " + data[i].averageGrade) : data[i].functionDescription;
    
            sectionTitle.appendChild(titleHeader);

            if(isCurrentUserProfile) {

                let editIcon = document.createElement("i");

                editIcon.className = "fas fa-edit d-flex justify-content-end align-items-center";
                editIcon.style = "width:10%;height:30px;font-size:24px;color:rgb(143,143,143);";
                editIcon.setAttribute("data-bs-toggle", "modal");
                editIcon.setAttribute("data-bs-target", "#mainModal");
                editIcon.onclick = (isCourse) ? function() { buildModalForm("Course", data[i], coursesOptions, session); } : function() { buildModalForm("Workplace", data[i], undefined, session); };

                sectionTitle.appendChild(editIcon);
            }
    
            bodyDiv.appendChild(sectionTitle);
            bodyDiv.appendChild(subtitleHeader);
            bodyDiv.appendChild(descriptionParagraph);
    
            mainDiv.appendChild(bodyDiv);

            list.appendChild(mainDiv);
        }

    }

}

let buildModalForm = function(typeRecord, data, coursesOptions, session) {

    let modalForm = document.getElementById("modalForm"),
        firstColumn = document.createElement("div"),
        secondColumn = document.createElement("div");

    while(modalForm.hasChildNodes()) {
        modalForm.removeChild(modalForm.firstChild);
    }
    
    modalForm.appendChild(firstColumn);
    modalForm.appendChild(secondColumn);

    firstColumn.className = "col-4 col-xl-3 d-block";
    firstColumn.style = "padding: 5px;";
    secondColumn.className = "col-3 col-xl-3 d-block";
    secondColumn.style = "padding: 5px;margin-left: 120px";


    if(typeRecord === "Course" || typeRecord === "User") {

        let firstSection = document.createElement("section"),
            firstLabel = document.createElement("label"),
            firstInput = document.createElement("input"),
            secondSection = document.createElement("section"),
            secondLabel = document.createElement("label"),
            secondInput = document.createElement("input"),
            thirdSection = document.createElement("section"),
            thirdLabel = document.createElement("label"),
            thirdInput = (typeRecord === "Course") ? document.createElement("select") : document.createElement("input"),
            fourthSection = document.createElement("section"),
            fourthLabel = document.createElement("label"),
            fourthInput = (typeRecord === "Course") ? document.createElement("input") : document.createElement("textarea");
        
        document.getElementById("modalContent").style = "width: 470px;";
        
        firstSection.className = "d-block";
        firstSection.style = "margin-top: 10px;";

        firstLabel.className = "form-label";
        firstLabel.style = "margin-right: 78px;margin-bottom: 0px;";
        firstLabel.textContent = "Name";
        
        firstInput.required = true;
        firstInput.name = "name";

        secondSection.className = "d-block";
        secondSection.style = "margin-top: 10px;";

        secondLabel.className = "form-label";
        secondLabel.style = "margin-right: 20px;margin-bottom: 0px;width: 120px !important;";
        secondLabel.textContent = (typeRecord === "Course") ? "School Name" : "Email";

        secondInput.required = true;
        secondInput.type = (typeRecord === "Course") ? "text" : "email";
        secondInput.name = (typeRecord === "Course") ? "schoolName" : "email";

        thirdSection.className = "d-block";
        thirdSection.style = "margin-top: 10px;";

        thirdLabel.className = "form-label";
        thirdLabel.style = (typeRecord === "Course") ? "margin-right: 90px;margin-bottom: 0px;" : "margin-right: 10px;margin-bottom: 0px;";
        thirdLabel.textContent = (typeRecord === "Course") ? "Type" : "Password";

        thirdInput.required = true;
        thirdInput.name = (typeRecord === "Course") ? "type" : "password";

        fourthSection.className = "d-block";
        fourthSection.style = "margin-top: 10px;";

        fourthLabel.className = "form-label";
        fourthLabel.style = "margin-right: 10px;margin-bottom: 0px;width: 120px !important;";
        fourthLabel.textContent = (typeRecord === "Course") ? "Average Grade" : "Description";

        fourthInput.required = true;
        fourthInput.className = (typeRecord === "Course") ? "form-control-sm" : "form-control-lg";
        fourthInput.style = (typeRecord === "Course") ? "width: 70px;" : "font-size: 16px;";
        fourthInput.name = (typeRecord === "Course") ? "averageGrade" : "description";

        if(typeRecord === "Course") {

            for(let i = 0; i < coursesOptions.length; i++) {

                let option = document.createElement("option");
    
                option.text = coursesOptions[i];
                thirdInput.add(option);
            }

            fourthInput.type ="number";
            fourthInput.max = 20;
            fourthInput.min = 0;

        } else {
            thirdInput.type = "password";
        }

        if(data) {

            firstInput.value = data.name;
            secondInput.value = (typeRecord === "Course") ? data.schoolName : data.email;
            thirdInput.value = (typeRecord === "Course") ? formatCourseTypeValue(data.type, false) : "";
            fourthInput.value = (typeRecord === "Course") ? data.averageGrade : data.description;

        }
        
        firstSection.appendChild(firstLabel);
        firstSection.appendChild(firstInput);

        secondSection.appendChild(secondLabel);
        secondSection.appendChild(secondInput);

        thirdSection.appendChild(thirdLabel);
        thirdSection.appendChild(thirdInput);

        fourthSection.appendChild(fourthLabel);
        fourthSection.appendChild(fourthInput);

        firstColumn.appendChild(firstSection);
        firstColumn.appendChild(secondSection);

        secondColumn.appendChild(thirdSection);
        secondColumn.appendChild(fourthSection);



    } else if(typeRecord === "Workplace") {

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
        
        nameSection.className = "d-block";
        nameSection.style = "margin-top: 10px;";

        nameLabel.className = "form-label";
        nameLabel.style = "margin-right: 78px;margin-bottom: 0px;";
        nameLabel.textContent = "Name";
        
        nameInput.required = true;
        nameInput.name = "name";

        logoSection.className = "d-block";
        logoSection.style = "margin-top: 10px;";

        logoLabel.className = "form-label";
        logoLabel.style = "margin-right: 20px;margin-bottom: 0px;";
        logoLabel.textContent = "Logo URL";

        logoInput.required = true;
        logoInput.type = "url";
        logoInput.name = "logoUrl";

        startDateSection.className = "d-block";
        startDateSection.style = "margin-top: 10px;";

        startDateLabel.className = "form-label";
        startDateLabel.style = "margin-right: 10px;margin-bottom: 0px;";
        startDateLabel.textContent = "Start Date";

        startDateInput.required = true;
        startDateInput.type ="date";
        startDateInput.name = "startDate";

        endDateSection.className = "d-block";
        endDateSection.style = "margin-top: 10px;";

        endDateLabel.className = "form-label";
        endDateLabel.style = "margin-right: 10px;margin-bottom: 0px;";
        endDateLabel.textContent = "End Date";

        endDateInput.required = true;
        endDateInput.type ="date";
        endDateInput.name = "endDate";

        functionSection.className = "d-block";
        functionSection.style = "margin-top: 10px;";

        functionLabel.className = "form-label";
        functionLabel.style = "margin-right: 20px;margin-bottom: 0px;width: 180px !important;";
        functionLabel.textContent = "Function Description";

        functionTextArea.required = true;
        functionTextArea.className ="form-control-lg";
        functionTextArea.style = "font-size: 16px;";
        functionTextArea.name = "functionDescription";

        if(data) {

            nameInput.value = data.name;
            logoInput.value = data.logoUrl;
            startDateInput.value = handleDates(data.startDate, true);
            endDateInput.value = handleDates(data.endDate, true);
            functionTextArea.value = data.functionDescription;

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

    }

    let firstButton = document.getElementById("firstButtonModal"),
        secondButton = document.getElementById("secondButtonModal");

    document.getElementById("modalContent").style = (typeRecord === "Course") ? "width: 470px;" : "width: 540px;";
    firstButton.textContent = (data) ? "Delete" : "Close";
    firstButton.style = (data) ? "background: #b10b00;border-color: #b10b00;color: rgb(255,255,255)" : "background: rgb(255,255,255);border-color: rgb(255,130,3);color: rgb(255,130,3)";
    secondButton.textContent = (data) ? "Save Changes" : "Submit";
    secondButton.style = (data) ? "background: rgb(255,130,3);border-color: rgb(255,255,255);" : "background: rgb(255,130,3);border-color: rgb(255,130,3);";
    document.getElementById("titleModal").textContent = (data) ? ("Edit " + typeRecord) : ("Add " + typeRecord);

    if(data) {

        firstButton.dataset.bsToggle = "modal";
        firstButton.dataset.bsTarget = "#modal-1";
        firstButton.setAttribute("data-id", data.id);
        document.getElementById("titleConfirmation").textContent = "Are you sure you want to delete this record?";
        document.getElementById("logout").onclick = function() {

            let idToDelete = firstButton.getAttribute("data-id");

            if(idToDelete) {
                const url = `http://${window.location.host}/api/${typeRecord.toLowerCase()}/delete/${idToDelete}`
                axios.post(url)
                .then(response => {
                    console.log(response);
                    checkAuthentication();
                })
                .catch(error => {
                    console.log(error);
                });
            }

        };

        firstButton.removeAttribute("data-bs-toggle");
        firstButton.removeAttribute("data-bs-target");

        modalForm.setAttribute("action", "/edit");
        modalForm.setAttribute("method", "/PUT");
        
        modalForm.onsubmit = function(event) {

            event.preventDefault() 

            let elements = modalForm.elements,
                body = {};

            if(typeRecord === "Course") {

                body = {
                    "averageGrade": elements.averageGrade.value,
                    "name": elements.name.value,
                    "schoolName": elements.schoolName.value,
                    "type": formatCourseTypeValue(elements.type.value, true)
                }

            } else if(typeRecord === "Workplace") {

                body = {
                    "name": elements.name.value,
                    "logoUrl": elements.logoUrl.value,
                    "startDate": elements.startDate.value,
                    "endDate": elements.endDate.value,
                    "functionDescription": elements.functionDescription.value
                }

            } else if(typeRecord === "User") {

                body = {
                    "name": elements.name.value,
                    "email": elements.email.value,
                    "password": elements.password.value,
                    "description": elements.description.value
                }

            }

            axios.post(`http://${window.location.host}/api/${typeRecord.toLowerCase()}/edit`, body)
                .then(response => {

                    console.log(typeRecord + " edit");
                    checkAuthentication();
                    document.getElementById("firstButtonModal").click();

                })
                .catch(error => {
                    if (error.response.status === 400) {
                        console.log(error);
                    }
                });

        }

    } else {
        firstButton.removeAttribute("data-bs-toggle");
        firstButton.removeAttribute("data-bs-target");

        modalForm.setAttribute("action", "/create");
        modalForm.setAttribute("method", "/POST");
        
        modalForm.onsubmit = function(event) {

            event.preventDefault() 

            let elements = modalForm.elements;

            let body = (typeRecord === "Course") ? {
                "averageGrade": elements.averageGrade.value,
                "name": elements.name.value,
                "schoolName": elements.schoolName.value,
                "type": formatCourseTypeValue(elements.type.value, true),
                "jobSeekerId": session.user.id
            } : {
                "name": elements.name.value,
                "logoUrl": elements.logoUrl.value,
                "startDate": elements.startDate.value,
                "endDate": elements.endDate.value,
                "functionDescription": elements.functionDescription.value,
                "jobSeekerId": session.user.id
            }

            axios.post(`http://${window.location.host}/api/${typeRecord.toLowerCase()}/create`, body)
                .then(response => {

                    console.log(typeRecord + " created");
                    checkAuthentication();
                    document.getElementById("firstButtonModal").click();

                })
                .catch(error => {
                    if (error.response.status === 400) {
                        console.log(error);
                    }
                });

        }
    }


}

window.onload = checkAuthentication;