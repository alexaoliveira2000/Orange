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

let init = function() {
    let pathname = window.location.pathname,
        pathnameArray = pathname.split("/"),
        value = pathnameArray[pathnameArray.length - 1];
    
        console.log(value);

    if(value) {
        const url = `http://${window.location.host}/api/profile/${value}`
        axios.get(url)
        .then(response => {
            buildDOM(response.data);
        })
        .catch(error => {

        });
    }

}

window.onload = init;