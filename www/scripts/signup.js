var checkAuthentication = function () {
    const url = `http://${window.location.host}/api/check-authentication`
    axios.get(url)
        .then(response => {
            init(response.data);
        })
        .catch(error => {

        });
}

var init = function (session) {
    formSubmitValidation();
    changeFormType();
}

var formSubmitValidation = function () {

    var resetErrors = function (nodeElements) {
        var elements = [...nodeElements];
        elements.forEach(function (element) {
            let elemErrorText = document.getElementById(element.id + "_error");
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

    let registerForm = document.forms.signupForm;
    let elements = registerForm.elements;

    registerForm.addEventListener('submit', function (event) {
        event.preventDefault();

        resetErrors(elements);

        let type = elements.user_type.value;

        let visibleCheckbox = elements.visible;
        visibleCheckbox.value = visibleCheckbox.checked;

        // validar passwords iguais
        if (elements.password.value !== elements.confirm_password.value) {
            showError("confirm_password_error", "Password is different");
            return;
        }
        let body = {
            "user_type": elements.user_type.value,
            "email": elements.email.value,
            "password": elements.password.value,
            "description": elements.description.value,
            "seeker_name": elements.seeker_name.value,
            "birth_date": elements.birth_date.value,
            "gender": elements.gender.value,
            "location": elements.location.value,
            "visible": elements.visible.value,
            "headhunter_name": elements.headhunter_name.value,
            "logo": elements.logo.value,
            "website": elements.website.value
        }
        axios.post(`http://${window.location.host}/api/users/${type}`, body)
            .then(response => {
                window.location.href = `http://${window.location.host}/login?userCreated`
            })
            .catch(error => {
                if (error.response.status === 400) {
                    error.response.data.errors.forEach(function (err) {
                        showError(err.param + "_error", err.msg);
                    });
                }
            });
    });
}

var changeFormType = function () {
    let jobSeekerCheckbox = document.getElementById("job_seeker");
    let headhunterCheckbox = document.getElementById("headhunter");
    let jobSeekerForm = document.getElementById("job_seeker_form");
    let headHunterForm = document.getElementById("headhunter_form");

    let seekerNameInput = document.getElementById("seeker_name");
    let birthDateInput = document.getElementById("birth_date");
    let genderInput = document.getElementById("gender");
    let locationInput = document.getElementById("location");

    let headHunterNameInput = document.getElementById("headhunter_name");
    let websiteInput = document.getElementById("website");
    let logoInput = document.getElementById("logo");

    jobSeekerCheckbox.addEventListener("click", function () {
        jobSeekerForm.style.display = "block";
        headHunterForm.style.display = "none";

        seekerNameInput.required = true;
        birthDateInput.required = true;
        genderInput.required = true;
        locationInput.required = true;

        headHunterNameInput.required = false;
        websiteInput.required = false;
        logoInput.required = false;
    });
    headhunterCheckbox.addEventListener("click", function () {
        headHunterForm.style.display = "block";
        jobSeekerForm.style.display = "none";

        seekerNameInput.required = false;
        birthDateInput.required = false;
        genderInput.required = false;
        locationInput.required = false;

        headHunterNameInput.required = true;
        websiteInput.required = true;
        logoInput.required = true;
    });
}

window.onload = checkAuthentication;