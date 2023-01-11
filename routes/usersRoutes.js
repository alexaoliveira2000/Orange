const express = require("express");
const router = express.Router();
const path = require("path");
const User = require("../models/usersModel");
const JobSeeker = require("../models/jobSeekersModel");
const Headhunter = require("../models/headhuntersModel");
const { body, validationResult } = require('express-validator');

router.post("/:type",
    body('email').trim().isEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('description').trim().isLength({ max: 255 }),
    body('user_type').trim().isIn(['job_seeker', 'headhunter']),
    function (req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        User.getUserByEmail(req.body.email, function (err, result) {
            if (err) {
                err.sendStatus(500);
            } else if (result) {
                res.status(400).json({
                    errors: [{
                        value: req.body.email,
                        msg: 'This email already exists',
                        param: 'email',
                        location: 'body'
                    }]
                });
                return;
            } else {
                next();
            }
        });
    });

router.post("/job_seeker",
    body("seeker_name").trim().not().isEmpty(),
    body("birth_date").trim().isDate(),
    body("gender").trim().isIn(['M', 'F']),
    body("location").trim().not().isEmpty(),
    body("visible").isBoolean(),
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        req.body.name = req.body.seeker_name;
        User.createUser(req.body, function (err1, result) {
            if (err1) {
                res.sendStatus(500);
            } else {
                JobSeeker.createJobSeeker(result.insertId, req.body, function (err2, result) {
                    if (err2) {
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(201);
                    }
                })
            }
        });
    });

router.post("/headhunter",
    body("headhunter_name").trim().not().isEmpty(),
    body("logo").trim().isURL(),
    body("website").trim().isURL(),
    function (req, res) {
        const errors = validationResult(req);
        console.log(errors.array());
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        req.body.name = req.body.headhunter_name;
        User.createUser(req.body, function (err1, result) {
            if (err1) {
                res.sendStatus(500);
            } else {
                Headhunter.createHeadhunter(result.insertId, req.body, function (err2, result) {
                    if (err2) {
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