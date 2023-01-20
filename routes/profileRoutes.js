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

/**
@function
@description A route handler for getting the user's information, jobseeker information, courses and workplaces.
@param {string} userKey - The key of the user to retrieve the information for.
@property {Session} session - The session object containing the user's information.
@throws {401} Will return a status code of 401 if the user is not authenticated or if there is no user with the provided key, or if there is an error while querying the database.
@throws {500} Will return a status code of 500 if there is an error while querying the database.
@returns {JSON} An object containing the user information, jobseeker information, courses and workplaces of the user.
*/
router.get("/:userKey", function (req, res) {
    let userKey = req.params.userKey,
        data = {};
    
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }
    
    if (userKey) {
        User.getUserByKey(userKey, (err, user) => {
            if(user) {
                data.user = user;
                JobSeeker.getJobSeeker(user.id, (err, jobSeeker) => {
                    data.user = Object.assign({}, user, jobSeeker);
                    if(jobSeeker) {
                        Course.getCoursesUser(user.id, (err, courses) => {
                            if(courses) {
                                data.courses = courses;
                                Course.getCourseTypeOptions((err, fieldOptions) => {
                                    if (fieldOptions) {
                                        data.coursesOptions = fieldOptions;
                                        Workplace.getWorkplacesUser(user.id, (err, workplaces) => {
                                            if (workplaces) {
                                                data.workplaces = workplaces;

                                                delete data.user.id;
                                                delete data.user.jobSeekerId;
                                                delete data.user.job_Seeker_id;

                                                data.courses.forEach(element => {
                                                    delete element.jobSeekerId;
                                                });

                                                data.workplaces.forEach(element => {
                                                    delete element.jobSeekerId;
                                                });

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