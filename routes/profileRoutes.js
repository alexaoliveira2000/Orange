const express = require("express");
const router = express.Router();
const User = require("../models/usersModel");
const Course = require("../models/coursesModel");
const Workplace = require("../models/workplacesModel");
const JobSeeker = require("../models/jobSeekersModel");

router.get("/", function (req, res) {
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }

    res.redirect(`/${req.session.user.key}`);
})

router.get("/:userKey", function (req, res) {
    let userKey = req.params.userKey,
        data = {};
    
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }
    
    if (userKey) {
        User.getUserByKey(userKey, (err, user) => {
            if(user) {
                console.log("User: " + user);
                data.user = user;
                JobSeeker.getJobSeeker(user.id, (err, jobSeeker) => {
                    data.user = Object.assign({}, user, jobSeeker);
                    if(jobSeeker) {
                        Course.getCoursesUser(user.id, (err, courses) => {
                            if(courses) {
                                data.courses = courses;
                                Workplace.getWorkplacesUser(user.id, (err, workplaces) => {
                                    if (workplaces) {
                                        data.workplaces = workplaces;
                                        res.status(200).send(data);

                                    } else if(err) {
                                        res.sendStatus(500);
                                    } else {
                                        res.sendStatus(401);
                                    }
                                });
                            } else if(err) {
                                res.sendStatus(500);
                            } else {
                                res.sendStatus(401);
                            }
                        });
                    } else if(err) {
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(401);
                    }
                })
            } else if(err) {
                res.sendStatus(500);
            } else {
                res.sendStatus(401);
            }
        })
    }
});

module.exports = router;