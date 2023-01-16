const express = require("express");
const router = express.Router();
const Course = require("../models/coursesModel");

router.post("/delete/:id", function (req, res) {
    let courseId = req.params.id;
    
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }
    
    if (courseId) {
        Course.deleteCourse(courseId, (err, suc) => {
            console.log("Teste: " + suc);
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

router.post("/create", function (req, res) {
        
    Course.createCourse(req.body, function (err, result) {
        if (err) {
            res.sendStatus(500);
        } else {
            res.sendStatus(201);
        }
    });
});

module.exports = router;