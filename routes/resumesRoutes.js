const express = require("express");
const JobSeeker = require("../models/jobSeekersModel");
const router = express.Router();
const { query, validationResult } = require('express-validator');

/**
*
* @function
* @route {GET} /
* @description Handles a GET request to retrieve resumes
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @property {string} req.query.minAge - The minimum age of the job seeker
* @property {string} req.query.maxAge - The maximum age of the job seeker
* @property {boolean} req.session.authenticated - Indicates if the user is authenticated
* @property {string} req.session.user.type - The type of the user
* @param {function} callback - A callback function that is called after resumes are retrieved
* @throws {401} If the user is not authenticated or the user is a job seeker
* @throws {400} If the age parameters are invalid
* @throws {500} If there is an error while retrieving resumes
*
*/

router.get("/",
    query("minAge").optional().isInt({min : 18, max : 65}),
    query("maxAge").optional().isInt({min : 18, max : 65}),
    function (req, res) {
    const errors = validationResult(req);
    if (!req.session.authenticated || req.session.user.type === "job_seeker") {
        res.sendStatus(401);
    } else if (!errors.isEmpty()) {
        res.json({ resumes: [] });
        return;
    }
    else {
        JobSeeker.getResumes(req.query, function (err, resumes) {
            if (err) {
                res.sendStatus(500);
            } else if (req.session.user.type === "headhunter") {
                let visibleResumes = resumes.filter(resume => resume.isVisibleToCompanies);
                res.json({ resumes: visibleResumes });
            } else if (req.session.user.type === "admin") {
                res.json({ resumes: resumes });
            }
            return;
        });
    }
});

module.exports = router;