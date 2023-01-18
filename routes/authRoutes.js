const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get('/', function (req, res) {
    res.redirect("/index");
});

/**
* Handles a GET request to retrieve the user's profile
*
* @function
* @route {GET} /profile
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @property {boolean} req.session.authenticated - Indicates if the user is authenticated
* @property {string} req.session.user.key - The key of the user
* @throws {401} If the user is not authenticated
* @throws {302} If the user is authenticated, redirects to the profile of the user using the user's key
*
*/
router.get("/profile", function (req, res) {
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }
    res.redirect(`profile/${req.session.user.key}`);
});

/**
* Handles a GET request to retrieve the profile of a user
*
* @function
* @route {GET} /profile/:key
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @property {string} req.params.key - The key of the user
* @property {boolean} req.session.authenticated - Indicates if the user is authenticated
* @throws {401} If the user is not authenticated
* @throws {200} If the user is authenticated and has permission to access the profile, sends the profile.html file
* @throws {404} If the user is authenticated but the key provided is not a valid key, sends the notfound.html file
* @throws {403} If the user is authenticated but does not have permission to access the profile, sends the unauthorized.html file
*
*/
router.get("/profile/:key", function (req, res, next) {
    console.log("mandou:" + req.params.key)
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }
    let isKey = !req.params.key.includes(".");
    let filePath = isKey ? path.join(__dirname, '../www/', "profile.html") : null;
    if (isKey && hasPermission(req.session, path.basename(filePath))) {
        res.sendFile(filePath);
    } else if (!isKey) {
        res.sendFile(path.join(__dirname, '../www/', "notfound.html"));
    } else {
        res.sendFile(path.join(__dirname, '../www/', "unauthorized.html"));
    }
    return;
});

/**
* Handles a GET request to retrieve the user's friends
*
* @function
* @route {GET} /friends
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @property {boolean} req.session.authenticated - Indicates if the user is authenticated
* @property {string} req.session.user.type - The type of the user
* @property {string} req.session.user.key - The key of the user
* @throws {401} If the user is not authenticated or the user is not a job seeker
* @throws {302} If the user is authenticated and is a job seeker, redirects to the friends of the user using the user's key
*
*/
router.get("/friends", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "job_seeker") {
        res.sendStatus(401);
    }
    res.redirect(`friends/${req.session.user.key}`);
});

/**
* Handles a GET request to retrieve the friends of a user
*
* @function
* @route {GET} /friends/:key
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @property {string} req.params.key - The key of the user
* @property {boolean} req.session.authenticated - Indicates if the user is authenticated
* @throws {401} If the user is not authenticated
* @throws {200} If the user is authenticated and has permission to access the friends, sends the friends.html file
* @throws {404} If the user is authenticated but the key provided is not a valid key, sends the notfound.html file
* @throws {403} If the user is authenticated but does not have permission to access the friends, sends the unauthorized.html file
*
*/
router.get("/friends/:key", function (req, res, next) {
    console.log("mandou:" + req.params.key)
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }
    let isKey = !req.params.key.includes(".");
    let filePath = isKey ? path.join(__dirname, '../www/', "friends.html") : null;
    if (isKey && hasPermission(req.session, path.basename(filePath))) {
        res.sendFile(filePath);
    } else if (!isKey) {
        res.sendFile(path.join(__dirname, '../www/', "notfound.html"));
    } else {
        res.sendFile(path.join(__dirname, '../www/', "unauthorized.html"));
    }
    return;
});

/**
* Handles a GET request to retrieve a specific page
*
* @function
* @route {GET} /:page
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @param {Object} next - Express next object
* @property {string} req.params.page - The name of the page requested
* @property {boolean} req.session.authenticated - Indicates if the user is authenticated
* @throws {200} If the page requested exists and the user has permission to access it, sends the requested page
* @throws {403} If the user is authenticated but does not have permission to access the page, sends the unauthorized.html file
* @throws {404} If the page requested does not exist, passes the request to the next middleware
*
*/
router.get('/:page', function (req, res, next) {
    let page = req.params.page;
    let isHtml = page.includes("html") || !page.includes(".");
    let filePath;
    if (isHtml) {
        filePath = path.join(__dirname, '../www/', page.split(".")[0] + '.html');
    } else {
        filePath = path.join(__dirname, '../www/', page);
    }
    if (fs.existsSync(filePath)) {
        if (isHtml && hasPermission(req.session, path.basename(filePath))) {
            res.sendFile(filePath);
        } else {
            res.sendFile(path.join(__dirname, '../www/', "unauthorized.html"));
        }
        return;
    } else {
        next();
    }
});

/**
* Validates if the user has permission to access a specific page
*
* @function
* @param {Object} session - Express session object
* @param {string} page - The name of the page
* @returns {boolean} - Indicates if the user has permission to access the page
*
*/
let hasPermission = function(session, page) {
    if (page === "index.html") {
        return true;
    }
    if (page === "about-us.html") {
        return true;
    }
    if (page === "headhunters.html") {
        return true;
    }
    if (page === "login.html") {
        return !session.authenticated;
    }
    if (page === "signup.html") {
        return !session.authenticated;
    }

    if (!session.authenticated) return false;

    if (session.user.type === "admin") return true;

    if (page === "profile.html") {
        return true;
    }
    if (page === "friends.html") {
        return true;
    }
    if (page === "job-offers.html") {
        return session.user.type === "job_seeker";
    }
    if (page === "resumes.html") {
        return session.user.type === "headhunter";
    }
    return false;
}

module.exports = router;