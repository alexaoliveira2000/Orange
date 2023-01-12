const express = require("express");
const router = express.Router();
const User = require("../models/usersModel");

router.post("/auth", function (req, res) {
    let email = req.body.email;
    let pass = req.body.password;
    if (!email || !pass) {
        res.sendStatus(401);
    }
    User.verifyUser(email, pass, function (err, user) {
        if (err) {
            res.sendStatus(500);
        } else if (!user) {
            res.sendStatus(401);
        } else if (user.type === "headhunter" && !user.validated) {
            res.sendStatus(412);
        } else {
            req.session.authenticated = true;
            req.session.user = user;
            res.sendStatus(200);
        }
    });
});

router.post("/logout", function (req, res) {
    if (!req.session.authenticated) {
        res.sendStatus(400).json("There is no user authenticated");
    } else {
        req.session.authenticated = false;
        req.session.user = null;
        res.sendStatus(200);
    }
});

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