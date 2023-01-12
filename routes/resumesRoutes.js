const express = require("express");
const JobSeeker = require("../models/jobSeekersModel");
const router = express.Router();

router.get("/", function (req, res) {
    if (!req.session.authenticated || req.session.user.type === "job_seeker") {
        res.sendStatus(401);
    } else {
        JobSeeker.getResumes(function (err, resumes) {
            if (err) {
                res.sendStatus(500);
            } else if (req.session.user.type === "headhunter") {
                let visibleResumes = resumes.filter(resume => resume.isVisibleToCompanies);
                res.json({ resumes: visibleResumes });
            } else if (req.session.user.type === "admin") {
                console.log(resumes)
                res.json({ resumes: resumes });
            }
            return;
        });
    }
});

module.exports = router;