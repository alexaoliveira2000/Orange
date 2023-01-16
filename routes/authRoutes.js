const express = require("express");
const router = express.Router();
const axios = require("axios");
const path = require("path");
const fs = require("fs");

router.get('/', function (req, res) {
    res.redirect("/index");
});

router.get("/profile", function (req, res) {
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }
    res.redirect(`profile/${req.session.user.key}`);
})

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
})

router.get("/friends", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "job_seeker") {
        res.sendStatus(401);
    }
    res.redirect(`friends/${req.session.user.key}`);
});

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
})

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
            //res.sendStatus(401);
            res.sendFile(path.join(__dirname, '../www/', "unauthorized.html"));
        }
    } else {
        next();
    }
});

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