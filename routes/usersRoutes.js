const express = require("express");
const router = express.Router();
const User = require("../models/usersModel");
const JobSeeker = require("../models/jobSeekersModel");
const Headhunter = require("../models/headhuntersModel");
const { body, validationResult } = require('express-validator');

/**
 * @function
 * @description Handle a POST request to the "/accept-headhunter" route. This function is used to accept a headhunter user after a admin user validates the user's information. 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {401} If the user is not authenticated or is not an admin
 * @throws {400} If the request body does not contain a key or if the user is not a headhunter or if the user is already validated
 * @throws {500} If there is an error during the process of getting the user by key or accepting the headhunter
 */
router.post("/accept-headhunter", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "admin") {
        res.sendStatus(401);
    }
    if (!req.body.key) {
        res.sendStatus(400);
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

/**
 * @function
 * @description Handle a POST request to the "/reject-headhunter" route. This function is used to reject a headhunter user after a admin user validates the user's information. It will delete the headhunter and the user from the system.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {401} If the user is not authenticated or is not an admin
 * @throws {400} If the request body does not contain a key or if the user is not a headhunter or if the user is already validated
 * @throws {500} If there is an error during the process of getting the user by key or deleting the headhunter or user
 */
router.post("/reject-headhunter", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "admin") {
        res.sendStatus(401);
    }
    if (!req.body.key) {
        res.sendStatus(400);
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

/**
 * @function
 * @description Handle a POST request to the "/:type" route. This function is used to validate the request body and check if the email is already in use.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {400} If the request body contains invalid data or the email is already in use
 * @throws {500} If there is an error during the process of getting the user by email
 * @property {Object} body - Express request body object
 * @property {string} body.email - The email of the user.
 * @property {string} body.password - The password of the user.
 * @property {string} body.description - The description of the user.
 * @property {string} body.user_type - The type of the user, can be job_seeker or headhunter
 */
router.post("/:type",
    body('email').trim().isEmail().isLength({ max: 60 }),
    body('password').trim().isLength({ min: 5 , max: 60}),
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

/**
 * @function
 * @description Handle a POST request to the "/job_seeker" route. This function is used to validate the request body and create a new job seeker user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {400} If the request body contains invalid data or the user is not 18 years old
 * @throws {500} If there is an error during the process of creating the user or job seeker.
 * @property {Object} body - Express request body object
 * @property {string} body.seeker_name - The name of the job seeker.
 * @property {string} body.birth_date - The birth date of the job seeker.
 * @property {string} body.gender - The gender of the job seeker, can be 'M' or 'F'.
 * @property {string} body.location - The location of the job seeker.
 * @property {boolean} body.visible - Indicates if the job seeker profile is visible or not.
 */
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

    /**
 * @function
 * @description Handle a POST request to the "/headhunter" route. This function is used to validate the request body and create a new headhunter user.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {400} If the request body contains invalid data
 * @throws {500} If there is an error during the process of creating the user or headhunter.
 * @property {Object} body - Express request body object
 * @property {string} body.headhunter_name - The name of the headhunter.
 * @property {string} body.logo - The logo url of the headhunter.
 * @property {string} body.website - The website url of the headhunter.
 */
router.post("/headhunter",
    body("headhunter_name").trim().not().isEmpty(),
    body("logo").trim().isURL(),
    body("website").trim().isURL(),
    function (req, res) {
        const errors = validationResult(req);

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

    /**
 * @function
 * @description Handle a GET request to the "/pending-headhunters" route. This function is used to get all the headhunters that are not validated yet.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {401} If the user is not authenticated or is not an admin
 * @throws {500} If there is an error during the process of getting the headhunters
 * @property {Object} headhunters - An array of headhunters that are not validated yet.
 */
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

/**
 * @function
 * @description Handle a GET request to the "/headhunters" route. This function is used to get all the validated headhunters.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {500} If there is an error during the process of getting the headhunters
 * @property {Object} headhunters - An array of validated headhunters.
 */
router.get("/headhunters", function (req, res) {
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

/**
 * @function
 * @description Handle a GET request to the "/" route. This function is used to get all the users.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {401} If the user is not authenticated or is not an admin
 * @throws {500} If there is an error during the process of getting the users
 * @property {Object} users - An array of all the users.
 */
router.get("/", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "admin") {
        res.sendStatus(401);
    }
    User.getUsers(function (err, users) {
        if (err) {
            res.sendStatus(500);
        }  else {
            res.json({ users: users });
        }
    });
});

/**
@function
@description Retrieves a user by ID from the database and returns it in the response.
@param {string} id - The ID of the user to retrieve.
@property {object} req - The request object.
@property {object} res - The response object.
@throws {401} If the user is not authenticated or is not an admin.
@throws {500} If an error occurs while trying to retrieve the user from the database.
@throws {404} If the user is not found in the database.
*/
router.get("/:id", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "admin") {
        res.sendStatus(401);
    }
    User.getUser(req.params.id, function (err, user) {
        if (err) {
            res.sendStatus(500);
        } else if (!user) {
            res.status(404).send(`User not found`);
        } else {
            res.json({ user: user });
        }
    });
});

/**
@function
@description Deletes a headhunter by key from the database.
@param {string} key - The key of the headhunter to delete.
@property {object} req - The request object.
@property {object} res - The response object.
@throws {401} If the user is not authenticated or is not an admin.
@throws {500} If an error occurs while trying to delete the headhunter from the database.
@throws {400} If the headhunter is not found in the database or is not of type "headhunter".
*/
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

/**
@function
@description Deletes a job-seeker by key from the database.
@param {string} key - The key of the job-seeker to delete.
@property {object} req - The request object.
@property {object} res - The response object.
@throws {401} If the user is not authenticated or is not an admin.
@throws {500} If an error occurs while trying to delete the job-seeker from the database.
@throws {400} If the job-seeker is not found in the database or is not of type "job-seeker".
*/
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

/**
@function
@description Edits a user and jobseeker information by key from the database.
@property {object} req - The request object, contains the user and jobseeker information to edit
@property {object} res - The response object.
@throws {401} If the user is not authenticated
@throws {500} If an error occurs while trying to edit the user and jobseeker from the database.
@throws {400} If the user or jobseeker information is invalid or does not meet the validation requirements.
*/
router.put("/edit", body('email').trim().isEmail().isLength({ max: 60 }),
    body('password').trim().custom(value => {
        if(!value || (value.length >= 5)) {
            return true;
        } else {
            throw new Error("The password needs to have atleast 5 characters.");
        }
    }),
    body('description').trim().isLength({ max: 255 }),
    body("name").trim().not().isEmpty(),
    body("birthDate").trim().isDate().custom(value => {
        let enteredDate = new Date(value);
        let miminumAdultDate = new Date();
        miminumAdultDate.setFullYear(miminumAdultDate.getFullYear() - 18);
        if (enteredDate > miminumAdultDate) {
            throw new Error("You need to have more than 18 years old!");
        }
        return true;
    }),
    body("gender").trim().isIn(['Masculino', 'Feminino']),
    body("location").trim().not().isEmpty(),
    body("isVisibleToCompanies").isBoolean(),
    function (req, res) {
            
        if(!req.session.authenticated) {
            res.sendStatus(401);
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        if(req.body) {

            let bodyUser = {
                "name": req.body.name,
                "email": req.body.email,
                "password": req.body.password,
                "description": req.body.description,
                "userKey": req.session.user.key
            },
                bodyJobSeeker = {
                    "gender": (req.body.gender === "Masculino") ? "M" : "F",
                    "birthDate": req.body.birthDate,
                    "location": req.body.location,
                    "isVisibleToCompanies": req.body.isVisibleToCompanies,
                    "jobSeekerId": req.session.user.id
                }
                User.editUser(bodyUser, (err, suc) => {
                    if(suc) {
                        JobSeeker.editJobSeeker(bodyJobSeeker, (err, suc) => {
                            if(suc) {
                                res.sendStatus(204);
                            }else if(err) {
                                res.sendStatus(500);
                            }
                        });
                    } else if(err) {
                        res.sendStatus(500);
                    }
                });
        }
    
});

module.exports = router; 