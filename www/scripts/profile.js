/**
checkAuthentication is a function that verifies the user's authentication status.
It makes a GET request to the server to check if the user is authenticated.
If the request is successful, it will execute the init function passing the response data as a parameter.
*/
let checkAuthentication = function () {
    const url = `http://${window.location.host}/api/check-authentication`
    axios.get(url)
        .then(response => {
            init(response.data);
        })
        .catch(error => {

        });
}

/**
Initializes the profile page by fetching user data from the server and building the DOM.
@function
@param {Object} session - current session object
*/
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

/**
Builds the navigation bar for the website based on the user's session.
If the user is not authenticated, a "Sign in" button will be displayed.
If the user is authenticated, a dropdown button with their name will be displayed,
with options for "Profile", "Friends", and "Sign out". Additionally, if the user is a job seeker,
the "Job Offers" button will be displayed, if the user is a headhunter, the "Resumes" button
will be displayed, and if the user is an admin, both buttons will be displayed.
@function
@param {Object} session - The current user's session.
@param {boolean} session.authenticated - Whether the user is authenticated or not.
@param {Object} session.user - The user's data.
@param {string} session.user.name - The user's name.
@param {string} session.user.type - The user's type.
*/
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

/**
@function
@param {Object} session - The session object.
This function is used to handle the logout event. It makes a POST request to the logout endpoint. If the request is successful, it redirects the user to the login page with a query parameter "userLogout". If there is an error, it redirects the user to the homepage.
*/
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

/**
@function
@param {Object} data - The data used to build the DOM.
@param {Object} session - The session object.
This function is used to build the DOM elements with the provided data. It sets the user's information, such as name, description, birthdate, gender, location and email. It also adds an "edit" button for the current user's profile. Additionally, it adds two "add" buttons for the current user's profile, one for adding a course and one for adding a workplace. If the current user is the profile owner, it will display the add and edit buttons. Lastly, it calls the buildLists function to build the courses and workplaces lists.
*/
let buildDOM = function(data, session) {

    let userData = data.user,
        coursesList = document.getElementById("coursesList"),
        workplacesList = document.getElementById("workplacesList"),
        isCurrentUserProfile = (data.user.key === session.user.key);

    data.coursesOptions = enumStringToArray(data.coursesOptions);

    document.getElementById("username").textContent = userData.name;
    document.getElementById("userDescription").textContent = userData.description;
    document.getElementById("userBirthDay").textContent = new Date(userData.birthDate).toLocaleDateString();
    document.getElementById("userGender").textContent = (userData.gender === "M") ? "Masculino" : "Feminino";
    document.getElementById("userLocation").textContent = userData.location;
    document.getElementById("userEmail").textContent = userData.email;

    document.getElementById("userEdit").onclick = function() { buildModalForm("Users", data.user, undefined, session) };
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

/**
@function
@param {String} enumString - A string representation of an ENUM type.
@returns {Array} An array of the ENUM options.
This function takes in a string representation of an ENUM type and returns an array of the options. It removes the "enum(" and ")" from the string and splits the options by ",". After that, it uses the formatCourseTypeValue function to format the options.
*/
let enumStringToArray = function(enumString) {

    enumString = enumString.replace("enum(", "").replace(")", "");

    let enumOptions = enumString.split(",");

    for(let i = 0; i < enumOptions.length; i++) {

        enumOptions[i] = formatCourseTypeValue(enumOptions[i], false);
    }

    return enumOptions;
}

/**
@function
@param {String} value - The value to format.
@param {Boolean} isReverse - A flag to determine whether the format should be reversed or not.
This function is used to format the value of course type. If isReverse is true, it will convert the value to lowercase, replace spaces with underscores. If isReverse is false, it will replace underscores with spaces and capitalize the first letter of each word.
*/
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

/**
@function
@param {HTMLElement} list - The list element to build the data in.
@param {Object} data - The data that will be used to build the list.
@param {Boolean} isCourse - A flag to determine whether the data is for courses or workplaces.
@param {Object} session - The session object.
This function is used to build and update a list of data, either "courses" or "workplaces" based on the value of "isCourse", in the provided "list" element. If "data" is empty, it will append a message to the list indicating that the user has no associated courses or workplaces, depending on the value of "isCourse". Otherwise, it will iterate through the "data" and create elements for each item, such as a "title", "subtitle", and "description". The elements will be appended to the "list" element. If the current user is the profile owner, the function will also add an edit icon to each element that when clicked will open a modal form to edit the item.
*/
let buildLists = function(list, data, isCourse, session) {

    let coursesOptions = (isCourse) ? data.coursesOptions : "",
        isCurrentUserProfile = (data.user.key === session.user.key);
        
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
            subtitleHeader.textContent = (isCourse) ? data[i].schoolName : new Date(data[i].startDate).toLocaleDateString() + " - " + new Date(data[i].endDate).toLocaleDateString();
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


    if(typeRecord === "Course" || typeRecord === "Users") {

        let firstSection = document.createElement("section"),
            firstLabel = document.createElement("label"),
            firstInput = document.createElement("input"),
            firstSmall = document.createElement("small"),
            secondSection = document.createElement("section"),
            secondLabel = document.createElement("label"),
            secondInput = document.createElement("input"),
            secondSmall = document.createElement("small"),
            thirdSection = document.createElement("section"),
            thirdLabel = document.createElement("label"),
            thirdInput = (typeRecord === "Course") ? document.createElement("select") : document.createElement("input"),
            thirdSmall = document.createElement("small"),
            fourthSection = document.createElement("section"),
            fourthLabel = document.createElement("label"),
            fourthInput = (typeRecord === "Course") ? document.createElement("input") : document.createElement("textarea"),
            fourthSmall = document.createElement("small");
        
        firstSection.className = "d-block";
        firstSection.style = "margin-top: 10px;";

        firstLabel.className = "form-label";
        firstLabel.style = "margin-right: 78px;margin-bottom: 0px;";
        firstLabel.textContent = "Name";
        
        firstInput.required = true;
        firstInput.name = "name";

        firstSmall.id = "nameError";
        firstSmall.style = "color: var(--bs-red); display: none;";

        secondSection.className = "d-block";
        secondSection.style = "margin-top: 10px;";

        secondLabel.className = "form-label";
        secondLabel.style = "margin-right: 20px;margin-bottom: 0px;width: 120px !important;";
        secondLabel.textContent = (typeRecord === "Course") ? "School Name" : "Email";

        secondInput.required = true;
        secondInput.type = (typeRecord === "Course") ? "text" : "email";
        secondInput.name = (typeRecord === "Course") ? "schoolName" : "email";

        secondSmall.id = (typeRecord === "Course") ? "schoolNameError" : "emailError";
        secondSmall.style = "color: var(--bs-red); display: none;";

        thirdSection.className = "d-block";
        thirdSection.style = "margin-top: 10px;";

        thirdLabel.className = "form-label";
        thirdLabel.style = (typeRecord === "Course") ? "margin-right: 90px;margin-bottom: 0px;" : "margin-right: 10px;margin-bottom: 0px;";
        thirdLabel.textContent = (typeRecord === "Course") ? "Type" : "Password";

        thirdInput.required = (typeRecord === "Course") ? true : false;
        thirdInput.name = (typeRecord === "Course") ? "type" : "password";

        thirdSmall.id = (typeRecord === "Course") ? "courseTypeError" : "passwordError";
        thirdSmall.style = "color: var(--bs-red); display: none;";

        fourthSection.className = "d-block";
        fourthSection.style = "margin-top: 10px;";

        fourthLabel.className = "form-label";
        fourthLabel.style = "margin-right: 10px;margin-bottom: 0px;width: 120px !important;";
        fourthLabel.textContent = (typeRecord === "Course") ? "Average Grade" : "Description";

        fourthInput.required = (typeRecord === "Course") ? true : false;
        fourthInput.className = (typeRecord === "Course") ? "form-control-sm" : "form-control-lg";
        fourthInput.style = (typeRecord === "Course") ? "width: 70px;" : "font-size: 16px;";
        fourthInput.name = (typeRecord === "Course") ? "averageGrade" : "description";

        fourthSmall.id = (typeRecord === "Course") ? "averageGradeError" : "descriptionError";
        fourthSmall.style = "color: var(--bs-red); display: none;";

        firstSection.appendChild(firstLabel);
        firstSection.appendChild(firstInput);
        firstSection.appendChild(firstSmall);

        secondSection.appendChild(secondLabel);
        secondSection.appendChild(secondInput);
        secondSection.appendChild(secondSmall);

        thirdSection.appendChild(thirdLabel);
        thirdSection.appendChild(thirdInput);
        thirdSection.appendChild(thirdSmall);

        fourthSection.appendChild(fourthLabel);
        fourthSection.appendChild(fourthInput);
        fourthSection.appendChild(fourthSmall);

        firstColumn.appendChild(firstSection);
        firstColumn.appendChild(secondSection);

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

            let fiveSection = document.createElement("section"),
            fiveLabel = document.createElement("label"),
            fiveInput = document.createElement("input"),
            fiveSmall = document.createElement("small"),
            sixthSection = document.createElement("section"),
            sixthLabel = document.createElement("label"),
            sixthInput = document.createElement("select"),
            sixthSmall = document.createElement("small"),
            sevenSection = document.createElement("section"),
            sevenLabel = document.createElement("label"),
            sevenInput = document.createElement("input"),
            sevenSmall = document.createElement("small"),
            eightSection = document.createElement("section"),
            eightLabel = document.createElement("label"),
            eightInput = document.createElement("input"),
            eightSmall = document.createElement("small"),
            optionOne = document.createElement("option"),
            optionTwo = document.createElement("option"); 

            fiveSection.className = "d-block";
            fiveSection.style = "margin-top: 10px;";

            fiveLabel.className = "form-label";
            fiveLabel.style = "margin-right: 10px;margin-bottom: 0px;";
            fiveLabel.textContent = "Date of Birth";

            fiveInput.required = true;
            fiveInput.type ="date";
            fiveInput.name = "birthDate";
            fiveInput.value = data.birthDate.substring(0, 10);

            fiveSmall.id = "birthDateError";
            fiveSmall.style = "color: var(--bs-red); display: none;";

            sixthSection.className = "d-block";
            sixthSection.style = "margin-top: 10px;";

            sixthLabel.className = "form-label";
            sixthLabel.style = "margin-right: 90px;margin-bottom: 0px;";
            sixthLabel.textContent = "Gender";

            optionOne.text = "Masculino";
            optionTwo.text = "Feminino";
            sixthInput.add(optionOne);
            sixthInput.add(optionTwo);

            sixthInput.required = true;
            sixthInput.name = "gender";
            sixthInput.value = (data.gender === "M") ? "Masculino" : "Feminino";

            sixthSmall.id = "genderError";
            sixthSmall.style = "color: var(--bs-red); display: none;";

            sevenSection.className = "d-inline-flex";
            sevenSection.style = "margin-top: 10px;width: 250px;";

            sevenLabel.className = "form-label";
            sevenLabel.style = "margin-right: 0px;margin-bottom: 0px;";
            sevenLabel.textContent = "I want companies to see me";
            
            sevenInput.type = "checkbox";
            sevenInput.style = "margin-left: 10px";
            sevenInput.name = "visible";
            sevenInput.checked = (data.isVisibleToCompanies === 1) ? true : false;

            sevenSmall.id = "visibleError";
            sevenSmall.style = "color: var(--bs-red); display: none;";

            eightSection.className = "d-block";
            eightSection.style = "margin-top: 10px;";

            eightLabel.className = "form-label";
            eightLabel.style = "margin-right: 78px;margin-bottom: 0px;";
            eightLabel.textContent = "Location";
            
            eightInput.required = true;
            eightInput.name = "location";
            eightInput.value = data.location;

            eightSmall.id = "locationError";
            eightSmall.style = "color: var(--bs-red); display: none;";

            fiveSection.appendChild(fiveLabel);
            fiveSection.appendChild(fiveInput);
            fiveSection.appendChild(fiveSmall);

            sixthSection.appendChild(sixthLabel);
            sixthSection.appendChild(sixthInput);
            sixthSection.appendChild(sixthSmall);

            sevenSection.appendChild(sevenLabel);
            sevenSection.appendChild(sevenInput);
            sevenSection.appendChild(sevenSmall);

            eightSection.appendChild(eightLabel);
            eightSection.appendChild(eightInput);
            eightSection.appendChild(eightSmall);

            firstColumn.appendChild(eightSection);
            firstColumn.appendChild(fiveSection);
            firstColumn.appendChild(sevenSection);

            secondColumn.appendChild(sixthSection);

        }

        secondColumn.appendChild(thirdSection);
        secondColumn.appendChild(fourthSection);

        if(data) {

            firstInput.value = data.name;
            secondInput.value = (typeRecord === "Course") ? data.schoolName : data.email;
            thirdInput.value = (typeRecord === "Course") ? formatCourseTypeValue(data.type, false) : "";
            fourthInput.value = (typeRecord === "Course") ? data.averageGrade : data.description;

        }



    } else if(typeRecord === "Workplace") {

        let nameSection = document.createElement("section"),
            nameLabel = document.createElement("label"),
            nameInput = document.createElement("input"),
            nameSmall = document.createElement("small"),
            logoSection = document.createElement("section"),
            logoLabel = document.createElement("label"),
            logoInput = document.createElement("input"),
            logoSmall = document.createElement("small"),
            startDateSection = document.createElement("section"),
            startDateLabel = document.createElement("label"),
            startDateInput = document.createElement("input"),
            startSmall = document.createElement("small"),
            endDateSection = document.createElement("section"),
            endDateLabel = document.createElement("label"),
            endDateInput = document.createElement("input"),
            endSmall = document.createElement("small"),
            functionSection = document.createElement("section"),
            functionLabel = document.createElement("label"),
            functionTextArea = document.createElement("textarea"),
            functionSmall = document.createElement("small");
        
        nameSection.className = "d-block";
        nameSection.style = "margin-top: 10px;";

        nameLabel.className = "form-label";
        nameLabel.style = "margin-right: 78px;margin-bottom: 0px;";
        nameLabel.textContent = "Name";
        
        nameInput.required = true;
        nameInput.name = "name";

        nameSmall.id = "nameError";
        nameSmall.style = "color: var(--bs-red); display: none;";

        logoSection.className = "d-block";
        logoSection.style = "margin-top: 10px;";

        logoLabel.className = "form-label";
        logoLabel.style = "margin-right: 20px;margin-bottom: 0px;";
        logoLabel.textContent = "Logo URL";

        logoInput.required = true;
        logoInput.type = "url";
        logoInput.name = "logoUrl";

        logoSmall.id = "logoUrlError";
        logoSmall.style = "color: var(--bs-red); display: none;";

        startDateSection.className = "d-block";
        startDateSection.style = "margin-top: 10px;";

        startDateLabel.className = "form-label";
        startDateLabel.style = "margin-right: 10px;margin-bottom: 0px;";
        startDateLabel.textContent = "Start Date";

        startDateInput.required = true;
        startDateInput.type ="date";
        startDateInput.name = "startDate";

        startSmall.id = "startDateError";
        startSmall.style = "color: var(--bs-red); display: none;";

        endDateSection.className = "d-block";
        endDateSection.style = "margin-top: 10px;";

        endDateLabel.className = "form-label";
        endDateLabel.style = "margin-right: 10px;margin-bottom: 0px;";
        endDateLabel.textContent = "End Date";

        endDateInput.required = true;
        endDateInput.type ="date";
        endDateInput.name = "endDate";

        endSmall.id = "endDateError";
        endSmall.style = "color: var(--bs-red); display: none;";

        functionSection.className = "d-block";
        functionSection.style = "margin-top: 10px;";

        functionLabel.className = "form-label";
        functionLabel.style = "margin-right: 20px;margin-bottom: 0px;width: 180px !important;";
        functionLabel.textContent = "Function Description";

        functionTextArea.required = true;
        functionTextArea.className ="form-control-lg";
        functionTextArea.style = "font-size: 16px;";
        functionTextArea.name = "functionDescription";

        functionSmall.id = "functionDescriptionError";
        functionSmall.style = "color: var(--bs-red); display: none;";

        if(data) {

            nameInput.value = data.name;
            logoInput.value = data.logoUrl;
            startDateInput.value = data.startDate.substring(0, 10);
            endDateInput.value = data.endDate.substring(0, 10);
            functionTextArea.value = data.functionDescription;

        }

        nameSection.appendChild(nameLabel);
        nameSection.appendChild(nameInput);
        nameSection.appendChild(nameSmall);

        logoSection.appendChild(logoLabel);
        logoSection.appendChild(logoInput);
        logoSection.appendChild(logoSmall);

        startDateSection.appendChild(startDateLabel);
        startDateSection.appendChild(startDateInput);
        startDateSection.appendChild(startSmall);

        endDateSection.appendChild(endDateLabel);
        endDateSection.appendChild(endDateInput);
        endDateSection.appendChild(endSmall);

        functionSection.appendChild(functionLabel);
        functionSection.appendChild(functionTextArea);
        functionSection.appendChild(functionSmall);

        firstColumn.appendChild(nameSection);
        firstColumn.appendChild(logoSection);
        firstColumn.appendChild(startDateSection);
        firstColumn.appendChild(endDateSection);

        secondColumn.appendChild(functionSection);

    }

    let firstButton = document.getElementById("firstButtonModal"),
        secondButton = document.getElementById("secondButtonModal");

    document.getElementById("modalContent").style = (typeRecord === "Course") ? "width: 470px;" : "width: 540px;";
    firstButton.textContent = (data && typeRecord !== "Users") ? "Delete" : "Close";
    firstButton.style = (data && typeRecord !== "Users") ? "background: #b10b00;border-color: #b10b00;color: rgb(255,255,255)" : "background: rgb(255,255,255);border-color: rgb(255,130,3);color: rgb(255,130,3)";
    secondButton.textContent = (data) ? "Save Changes" : "Submit";
    secondButton.style = "background: rgb(255,130,3);border-color: rgb(255,130,3);";
    document.getElementById("titleModal").textContent = (data) ? ("Edit " + typeRecord) : ("Add " + typeRecord);

    var resetErrors = function (nodeElements) {
        var elements = [...nodeElements];
        elements.forEach(function (element) {
            let elemErrorText = document.getElementById(element.id + "Error");
            if (elemErrorText) {
                elemErrorText.style.display = "none";
            }
        });
    }

    var showError = function (elementId, message) {
        let errorText = document.getElementById(elementId);
        errorText.textContent = message;
        errorText.style.display = "block";
    }

    if(data) {

        if(typeRecord !== "Users") {
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
        } else {
            firstButton.removeAttribute("data-bs-toggle");
            firstButton.removeAttribute("data-bs-target");
        }

        modalForm.setAttribute("action", "/edit");
        modalForm.setAttribute("method", "/PUT");
        
        modalForm.onsubmit = function(event) {

            event.preventDefault();

            let elements = modalForm.elements,
                body = {},
                idToEdit = firstButton.getAttribute("data-id");

                resetErrors(elements);

            if(typeRecord === "Course") {

                body = {
                    "averageGrade": elements.averageGrade.value,
                    "name": elements.name.value,
                    "schoolName": elements.schoolName.value,
                    "type": formatCourseTypeValue(elements.type.value, true),
                    "id": idToEdit
                }

            } else if(typeRecord === "Workplace") {

                body = {
                    "name": elements.name.value,
                    "logoUrl": elements.logoUrl.value,
                    "startDate": elements.startDate.value,
                    "endDate": elements.endDate.value,
                    "functionDescription": elements.functionDescription.value,
                    "id": idToEdit
                }

            } else if(typeRecord === "Users") {

                body = {
                    "name": elements.name.value,
                    "email": elements.email.value,
                    "password": elements.password.value,
                    "description": elements.description.value,
                    "gender": elements.gender.value,
                    "birthDate": elements.birthDate.value,
                    "location": elements.location.value,
                    "isVisibleToCompanies": Boolean(elements.visible.value),
                }

            }

            axios.put(`http://${window.location.host}/api/${typeRecord.toLowerCase()}/edit`, body)
                .then(response => {

                    console.log(typeRecord + " edit");
                    checkAuthentication();
                    firstButton.removeAttribute("data-bs-toggle");
                    firstButton.removeAttribute("data-bs-target");
                    document.getElementById("firstButtonModal").click();

                })
                .catch(error => {
                    if (error.response.status === 400) {
                        error.response.data.errors.forEach(function (err) {
                            showError(err.param + "Error", err.msg);
                        });
                    }
                });

        }

    } else {
        firstButton.removeAttribute("data-bs-toggle");
        firstButton.removeAttribute("data-bs-target");

        modalForm.setAttribute("action", "/create");
        modalForm.setAttribute("method", "/POST");
        
        modalForm.onsubmit = function(event) {

            event.preventDefault();

            let elements = modalForm.elements;

            resetErrors(elements);

            let body = (typeRecord === "Course") ? {
                "averageGrade": elements.averageGrade.value,
                "name": elements.name.value,
                "schoolName": elements.schoolName.value,
                "type": formatCourseTypeValue(elements.type.value, true)
            } : {
                "name": elements.name.value,
                "logoUrl": elements.logoUrl.value,
                "startDate": elements.startDate.value,
                "endDate": elements.endDate.value,
                "functionDescription": elements.functionDescription.value
            }

            axios.post(`http://${window.location.host}/api/${typeRecord.toLowerCase()}/create`, body)
                .then(response => {

                    console.log(typeRecord + " created");
                    checkAuthentication();
                    document.getElementById("firstButtonModal").click();

                })
                .catch(error => {
                    if (error.response.status === 400) {
                        error.response.data.errors.forEach(function (err) {
                            showError(err.param + "Error", err.msg);
                        });
                    }
                });

        }
    }


}

window.onload = checkAuthentication;