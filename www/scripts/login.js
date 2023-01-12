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
    checkUserCreated();
    formSubmitValidation();
}

var checkUserCreated = function () {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    if (urlParams.has("userCreated")) {
        let loginMessage = document.getElementById("login_message");
        loginMessage.style.display = "block";
        loginMessage.textContent = "Your account has been created!";
    } else if (urlParams.has("userLogout")) {
        let loginMessage = document.getElementById("login_message");
        loginMessage.style.display = "block";
        loginMessage.textContent = "You signed out!";
    } else if (urlParams.has("waitingValidation")) {
        let loginMessage = document.getElementById("login_message");
        loginMessage.style.display = "block";
        loginMessage.textContent = "Headhunter was not accepted!";
    }
}

var formSubmitValidation = function () {

    console.log();

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

    let loginForm = document.forms.loginForm;
    let elements = loginForm.elements;

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        resetErrors(elements);
        let body = {
            "email": elements.email.value,
            "password": elements.password.value,
        }
        axios.post(`http://${window.location.host}/api/auth/`, body)
            .then(response => {
                window.location.href = `http://${window.location.host}/`
            })
            .catch(error => {
                if (error.response.status === 401) {
                    showError("email_error", "Invalid email or password");
                    showError("password_error", "Invalid email or password");
                } else if (error.response.status === 412) {
                    window.location.href = `http://${window.location.host}/login?waitingValidation`
                }
            });
    });
}

window.onload = checkAuthentication;