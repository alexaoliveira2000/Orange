const express = require("express");
const router = express.Router();
const Workplace = require("../models/workplacesModel");
const { body, validationResult } = require('express-validator');

router.post("/delete/:id", function (req, res) {
    let workplaceId = req.params.id;
    
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }
    
    if (workplaceId) {
        Workplace.deleteWorkplace(workplaceId, (err, suc) => {
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

router.post("/create", body("name").trim().isLength({ max: 255 }).not().isEmpty(),
    body("logoUrl").trim().isURL().isLength({ max: 255 }).not().isEmpty(),
    body("startDate").trim().isDate().custom(value => {
        let enteredDate = new Date(value);
        let miminumDate = new Date();
        if (enteredDate > miminumDate) {
            throw new Error("The date must be less than today.");
        }
        return true;
    }),
    body("endDate").trim().isDate().custom(value => {
        let enteredDate = new Date(value);
        let miminumDate = new Date();
        if (enteredDate > miminumDate) {
            throw new Error("The date must be less than today.");
        }
        return true;
    }),
    body("functionDescription").trim().isLength({ max: 255 }).not().isEmpty(),
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

            if(req.body) {
                Workplace.createWorkplace(req.body, function (err, result) {
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(201);
                    }
                });
            }
});

router.put("/edit", body("name").trim().isLength({ max: 255 }).not().isEmpty(),
    body("logoUrl").trim().isURL().isLength({ max: 255 }).not().isEmpty(),
    body("startDate").trim().isDate().custom(value => {
        let enteredDate = new Date(value);
        let miminumDate = new Date();
        if (enteredDate > miminumDate) {
            throw new Error("The date must be less than today.");
        }
        return true;
    }),
    body("endDate").trim().isDate().custom(value => {
        let enteredDate = new Date(value);
        let miminumDate = new Date();
        if (enteredDate > miminumDate) {
            throw new Error("The date must be less than today.");
        }
        return true;
    }),
    body("functionDescription").trim().isLength({ max: 255 }).not().isEmpty(),
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

            if(req.body) {
                Workplace.editWorkplace(req.body, function (err, result) {
                    if(result) {
                        res.sendStatus(204);
                    } else if(err) {
                        res.sendStatus(500);
                    }
                });
            }
});

module.exports = router;