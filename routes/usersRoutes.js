const express = require("express");
const router = express.Router();
const path = require("path");
const User = require("../models/usersModel");
//const JobSeeker = require("../models/jobSeekersModel");
//const Headhunter = require("../models/headhuntersModel");
const { body, validationResult } = require('express-validator');

router.post("/:type",
    body('email').trim().isEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('description').trim().not().isEmpty().trim().escape(),
    body('type').trim().isIn(['job_seeker', 'headhunter']),
    function (req, res, next) {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        next();
    });

router.post("/job_seeker",
    body("name").trim().not().isEmpty(),
    body("birthDate").trim().isDate(),
    body("location").trim().not().isEmpty(),
    body("isVisible").isBoolean(),
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        let userInfo = [
            req.body.email,
            req.body.password,
            req.body.description,
            req.body.type
        ]
        let jobSeekerInfo = [
            req.body.name,
            req.body.birthDate,
            req.body.location,
            req.body.isVisible
        ]
        User.createUser(userInfo, function (err, result) {
            if (err) {
                res.sendStatus(500);
            } else {
                JobSeeker.createJobSeeker(jobSeekerInfo, function (err, result) {
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(201);
                    }
                })
            }
        });
    });

router.post("/headhunter",
    body("name").trim().not().isEmpty(),
    body("birthDate").trim().isDate(),
    body("location").trim().not().isEmpty(),
    body("isVisible").isBoolean(),
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        }
        let userInfo = [
            req.body.email,
            req.body.password,
            req.body.description,
            req.body.type
        ]
        let headhunterInfo = [
            req.body.name,
            req.body.birthDate,
            req.body.location,
            req.body.isVisible
        ]
        User.createUser(userInfo, function (err, result) {
            if (err) {
                res.sendStatus(500);
            } else {
                Headhunter.createJobSeeker(headhunterInfo, function (err, result) {
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(201);
                    }
                })
            }
        });
    });

router.get("/", function (req, res) {
    User.getUsers(function (err, users) {
        if (err) {
            res.status(404).send(err);
        } else if (users.length === 0) {
            res.status(404).send(`Model "users" has no data`);
        } else {
            res.json({ users: users });
        }
    });
});

router.get("/:id", function (req, res) {
    const id = req.params.id;
    User.getUser(id, function (err, user) {
        if (err) {
            res.status(404).send(err);
        } else if (!user) {
            res.status(404).send(`User not found`);
        } else {
            res.json({ user: user });
        }
    });
});

module.exports = router;