const express = require("express");
const Headhunter = require("../models/headhuntersModel");
const router = express.Router();
const User = require("../models/usersModel");

/**
* Handles a POST request to authenticate a user
*
* @function
* @route {POST} /auth
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @property {string} req.body.email - The email of the user
* @property {string} req.body.password - The password of the user
* @property {boolean} req.session.authenticated - Indicates if the user is authenticated
* @property {Object} req.session.user - The user object
* @param {function} callback - A callback function that is called after the user is verified
* @throws {401} If the email and/or password is not provided or the user is not found
* @throws {500} If there is an error while verifying the user
* @throws {412} If the headhunter is not yet validated
*
*/
router.post("/auth", function (req, res) {
    let email = req.body.email;
    let pass = req.body.password;
    if (!email || !pass) {
        res.sendStatus(401);
    }
    User.verifyUser(email, pass, function (err, user) {
        console.log(user)
        if (err) {
            res.sendStatus(500);
        } else if (!user) {
            res.sendStatus(401);
        } else if (user.type === "headhunter") {
            Headhunter.getHeadhunter(user.id, function (err, headhunter) {
                if (err) {
                    res.sendStatus(500);
                } else if (!headhunter.validated) {
                    res.sendStatus(412);
                } else {
                    req.session.authenticated = true;
                    req.session.user = user;
                    res.sendStatus(200);
                }
            })
        } else {
            req.session.authenticated = true;
            req.session.user = user;
            res.sendStatus(200);
        }
    });
});

/**
* Handles a POST request to logout a user
*
* @function
* @route {POST} /logout
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @property {boolean} req.session.authenticated - Indicates if the user is authenticated
* @property {Object} req.session.user - The user object
* @throws {400} If there is no user authenticated
* @throws {200} If the user is successfully logged out
*
*/
router.post("/logout", function (req, res) {
    if (!req.session.authenticated) {
        res.send(400).json({error: "There is no user authenticated"});
        return;
    } else {
        req.session.authenticated = false;
        req.session.user = null;
        res.sendStatus(200);
    }
});

/**
* Handles a GET request to check if the user is authenticated
*
* @function
* @route {GET} /check-authentication
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @property {boolean} req.session.authenticated - Indicates if the user is authenticated
* @property {Object} req.session.user - The user object
* @throws {200} If the user is authenticated, returns the session object
* @throws {200} If the user is not authenticated, returns {authenticated: false}
*
*/
router.get("/check-authentication", function (req, res) {
    if (req.session.authenticated) {
        res.json(req.session);
        return;
    } else {
        res.send({ authenticated: false });
        return;
    }
});

module.exports = router;