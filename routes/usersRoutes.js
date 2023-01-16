const express = require("express");
const router = express.Router();
const User = require("../models/usersModel");
const JobSeeker = require("../models/jobSeekersModel");
const Headhunter = require("../models/headhuntersModel");
const { body, validationResult } = require('express-validator');

router.post("/accept-headhunter", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "admin") {
        res.sendStatus(401);
    }
    User.getUserByKey(req.body.key, function (err, user) {
        if (err) {
            res.sendStatus(500);
        } else if (!user || user.type !== "headhunter" || user.validated) {
            res.sendStatus(400);
        } else {
            Headhunter.acceptHeadhunter(user.id, function (err, result) {
                if (err) {
                    res.sendStatus(500);
                } else {
                    res.sendStatus(200);
                }
            });
        }
    });
});

router.post("/reject-headhunter", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "admin") {
        res.sendStatus(401);
    }
    User.getUserByKey(req.body.key, function (err, user) {
        if (err) {
            res.sendStatus(500);
        } else if (!user || user.type !== "headhunter" || user.validated) {
            res.sendStatus(400);
        } else {
            Headhunter.deleteHeadhunter(user.id, function (err, result) {
                if (err) {
                    res.sendStatus(500);
                } else {
                    User.deleteUser(user.id, function (err, result) {
                        if (err) {
                            res.sendStatus(500);
                        } else {
                            res.sendStatus(200);
                        }
                    });
                }
            });
        }
    });

});

router.post("/:type",
    body('email').trim().isEmail().isLength({ max: 60 }),
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
    body("birth_date").trim().isDate().custom(value => {
        let enteredDate = new Date(value);
        let miminumAdultDate = new Date();
        miminumAdultDate.setFullYear(miminumAdultDate.getFullYear() - 18);
        if (enteredDate > miminumAdultDate) {
            throw new Error("You need to have more than 18 years old!");
        }
        return true;
    }),
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

router.get("/pending-headhunters", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "admin") {
        res.sendStatus(401);
    }
    Headhunter.getHeadhunters(function (err, headhunters) {
        if (err) {
            res.sendStatus(500);
        } else if (headhunters.length === 0) {
            res.json({ headhunters: [] });
        } else {
            res.json({ headhunters: headhunters.filter(headhunter => !headhunter.validated) });
        }
    });
});

router.get("/headhunters", function (req, res) {
/*     if (!req.session.authenticated || req.session.user.type !== "admin") {
        res.sendStatus(401);
    } */
    Headhunter.getHeadhunters(function (err, headhunters) {
        if (err) {
            res.sendStatus(500);
        } else if (headhunters.length === 0) {
            res.json({ headhunters: [] });
        } else {
            res.json({ headhunters: headhunters.filter(headhunter => headhunter.validated) });
        }
    });
});

router.get("/", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "admin") {
        res.sendStatus(401);
    }
    User.getUsers(function (err, users) {
        if (err) {
            res.status(404).send(err);
        }  else {
            res.json({ users: users });
        }
    });
});

router.get("/:id", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "admin") {
        res.sendStatus(401);
    }
    User.getUser(req.params.id, function (err, user) {
        if (err) {
            res.status(404).send(err);
        } else if (!user) {
            res.status(404).send(`User not found`);
        } else {
            res.json({ user: user });
        }
    });
});

router.delete("/headhunter/:key", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "admin") {
        res.sendStatus(401);
    }
    User.getUserByKey(req.params.key, function (err1, user) {
        if (err1) {
            res.sendStatus(500);
        } else if (!user || user.type !== "headhunter") {
            res.sendStatus(400);
        } else {
            console.log(req.params.key)
            console.log(user)
            Headhunter.deleteHeadhunter(user.id, function (err2, result) {
                if (err2) {
                    res.sendStatus(500);
                } else {
                    User.deleteUser(user.id, function (err3, result) {
                        if (err3) {
                            res.sendStatus(500);
                        } else {
                            res.sendStatus(200);
                        }
                    });
                }
            });
        }
    });
});

router.delete("/job-seeker/:key", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "admin") {
        res.sendStatus(401);
    }
    User.getUserByKey(req.params.key, function (err1, user) {
        if (err1) {
            res.sendStatus(500);
        } else if (!user || user.type !== "job_seeker") {
            res.sendStatus(400);
        } else {
            JobSeeker.deleteJobSeeker(user.id, function (err2, result) {
                if (err2) {
                    res.sendStatus(500);
                } else {
                    User.deleteUser(user.id, function (err3, result) {
                        if (err3) {
                            res.sendStatus(500);
                        } else {
                            res.sendStatus(200);
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;