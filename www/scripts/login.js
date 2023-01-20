var checkAuthentication = function () {
    const url = `http://${window.location.host}/api/check-authentication`
    axios.get(url)
        .then(response => {
            init(response.data);
        })
        .catch(error => {

        });
}
/**
@function init
@param {Object} session
@description This function initiates the login page by calling the checkUserCreated and formSubmitValidation functions
*/
var init = function (session) {
    checkUserCreated();
    formSubmitValidation();
}

/**
@function checkUserCreated
@description This function checks the query string in the current URL and displays a message based on the query string parameter.
*/
var checkUserCreated = function () {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    if (urlParams.has("userCreated")) {
        let loginMessage = document.getElementById("login_message");
        loginMessage.style.display = "block";
        loginMessage.textContent = "Your account has been created!";
    } else if (urlParams.has("headhunterCreated")) {
        let loginMessage = document.getElementById("login_message");
        loginMessage.style.display = "block";
        loginMessage.textContent = "Your account has been created, wait for an approval!";
    } else if (urlParams.has("userLogout")) {
        let loginMessage = document.getElementById("login_message");
        loginMessage.style.display = "block";
        loginMessage.textContent = "You signed out!";
    } else if (urlParams.has("waitingValidation")) {
        let loginMessage = document.getElementById("login_message");
        loginMessage.style.display = "block";
        loginMessage.textContent = "Headhunter is not yet accepted!";
    }
}

/**

/**
@function formSubmitValidation
@description Form submit validation function that handles the login form submission and validation.
*/
var formSubmitValidation = function () {
    
    /**
    @function resetErrors
    @param {NodeElements} nodeElements - Node elements object
    @description Resets errors in the form elements
    */
    var resetErrors = function (nodeElements) {
        var elements = [...nodeElements];
        elements.forEach(function (element) {
            let elemErrorText = document.getElementById(element.id + "_error");
            if (elemErrorText) {
                elemErrorText.style.display = "none";
            }
        });
    }

    /**
    @function showError
    @param {string} elementId - Id of the element to show the error
    @param {string} message - Error message
    @description shows an error message for a specific element
    */
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