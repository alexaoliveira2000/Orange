const express = require("express");
const router = express.Router();
const Course = require("../models/coursesModel");
const { body, validationResult } = require('express-validator');

/**
*
* @function
* @route {DELETE} /delete/:id
* @description Handles a DELETE request to delete a course by ID
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @property {string} req.params.id - The ID of the course to be deleted
* @property {boolean} req.session.authenticated - Indicates if the user is authenticated
* @param {function} callback - A callback function that is called after the course is deleted
* @throws {401} If the user is not authenticated
* @throws {404} If the course is not found
* @throws {500} If there is an error while deleting the course
*/
router.post("/delete/:id", function (req, res) {
    let courseId = req.params.id;
    
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }
    
    if (courseId) {
        Course.deleteCourse(courseId, (err, suc) => {
            if(suc) {
                res.sendStatus(204);
            } else if(err) {
                res.sendStatus(500);
            } else {
                res.sendStatus(401);
            }
        })
    }
});

/**
*
* @function
* @route {PUT} /edit
* @description Handles a PUT request to edit a course
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @property {string} req.body.name - The name of the course
* @property {string} req.body.schoolName - The name of the school
* @property {string} req.body.averageGrade - The average grade of the course
* @property {string} req.body.courseType - The type of the course
* @property {string} req.body.jobSeekerId - The ID of the job seeker
* @property {boolean} req.session.authenticated - Indicates if the user is authenticated
* @throws {401} If the user is not authenticated
* @throws {400} If the course data is invalid
* @throws {500} If there is an error while editing the course
*
*/
router.put("/edit", body("name").trim().isLength({ max: 255 }).not().isEmpty(),
    body("schoolName").trim().isLength({ max: 255 }).not().isEmpty(),
    body("averageGrade").trim().isInt().isLength({ max: 2 }).not().isEmpty(),
    body("courseType").trim().isIn(['masters_degree', 'graduation_degree', "certification", "PhD"]),
    body("jobSeekerId").trim().not().isEmpty(),
    function (req, res) {

        if(!req.session.authenticated) {
            res.sendStatus(401);
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        req.body.id = req.session.user.id;
        
        if (req.body) {
            Course.editCourse(req.body, (err, suc) => {
                if(suc) {
                    res.sendStatus(204);
                } else if(err) {
                    res.sendStatus(500);
                } else {
                    res.sendStatus(401);
                }
            })
        }
});

/**
*
* @function
* @route {POST} /create
* @description Handles a POST request to create a new course
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @property {string} req.body.name - The name of the course
* @property {string} req.body.schoolName - The name of the school
* @property {string} req.body.averageGrade - The average grade of the course
* @property {string} req.body.courseType - The type of the course
* @property {boolean} req.session.authenticated - Indicates if the user is authenticated
* @param {function} callback - A callback function that is called after the course is created
* @throws {401} If the user is not authenticated
* @throws {400} If the course data is invalid
* @throws {500} If there is an error while creating the course
*
*/
router.post("/create", body("name").trim().isLength({ max: 255 }).not().isEmpty(),
    body("schoolName").trim().isLength({ max: 255 }).not().isEmpty(),
    body("averageGrade").trim().isInt().isLength({ max: 2 }).not().isEmpty(),
    body("courseType").trim().isIn(['masters_degree', 'graduation_degree', "certification", "PhD"]),
    function (req, res) {

        if(!req.session.authenticated) {
            res.sendStatus(401);
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        req.body.id = req.session.user.id;
            
        Course.createCourse(req.body, function (err, result) {
            if (err) {
                res.sendStatus(500);
            } else {
                res.sendStatus(201);
            }
        });
});

module.exports = router;