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
router.get is a method provided by the Express.js framework that creates a route and maps it to a callback function.
This route listens for a GET request made to a path that includes a parameter named "userKey".
When this route is hit, it will execute the callback function passed to the router.get method.
Inside the callback function, it first checks if the session is authenticated.
If it is not, it sends a 401 status code.
Next, it checks if the userKey is provided, then it will pass this userKey to the User.getUserByKey method that will
return the user that has that corresponding key, then pass this user id to the JobSeeker.getJobSeeker method which
returns the corresponding JobSeeker, after that its used Course.getCoursesUser method to return the courses associated
to the user, it also calls the Course.getCourseTypeOptions method to get the courses types, finally the Workplace.getWorkplacesUser
method is called and this method returns the workplaces associated to the user.
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
                console.log("User: " + user);
                console.log("username: " + user.name)
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