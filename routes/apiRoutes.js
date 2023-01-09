const express = require("express");
const router = express.Router();
const User = require("../models/usersModel");

router.post("/auth", function (req, res) {
    let email = req.body.email;
    let pass = req.body.password;
    if (!email || !pass) {
        res.sendStatus(401);
    }
    User.verifyUser(email, pass, function (err, isVerified) {
        if (err) {
            res.sendStatus(500);
        } else if (!isVerified) {
            res.sendStatus(401);
        } else {
            req.session.authenticated = true;
            req.session.user = {
                email: email,
                type: "job_seeker"
            }
            res.sendStatus(200);
        }
    })
});

router.get("/check-authentication", function (req, res) {
    if (req.session.authenticated) {
        res.json(session);
    } else {
        res.send({ authenticated: false });
    }
});

module.exports = router;