const express = require("express");
const JobSeeker = require("../models/jobSeekersModel");
const router = express.Router();
const { query, validationResult } = require('express-validator');

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