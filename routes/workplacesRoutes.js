const express = require("express");
const router = express.Router();
const Workplace = require("../models/workplacesModel");
const { body, validationResult } = require('express-validator');

/**
@function
@param {string} id - The id of the workplace to delete.
@property {Object} req - The request object.
@property {Object} res - The response object.
@throws {401} - If the user is not authenticated.
@throws {500} - If there is an error deleting the workplace.
@throws {400} - If the workplace id is not provided.
@description Handles the deletion of a workplace by its id.
*/
router.post("/delete/:id", function (req, res) {
    let workplaceId = req.params.id;
    
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }
    
    if (workplaceId) {
        Workplace.deleteWorkplace(workplaceId, (err, suc) => {
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
@function
@param {string} name - The name of the workplace.
@param {string} logoUrl - The URL of the workplace's logo.
@param {string} startDate - The start date of the workplace.
@param {string} endDate - The end date of the workplace.
@param {string} functionDescription - The description of the workplace.
@property {Object} req - The request object.
@property {Object} res - The response object.
@throws {401} - If the user is not authenticated.
@throws {500} - If there is an error creating the workplace.
@throws {400} - If the validation of the request body fails.
@description Handles the creation of a new workplace.
*/
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

/**
@function
@param {string} name - The new name of the workplace.
@param {string} logoUrl - The new URL of the workplace's logo.
@param {string} startDate - The new start date of the workplace.
@param {string} endDate - The new end date of the workplace.
@param {string} functionDescription - The new description of the workplace.
@property {Object} req - The request object.
@property {Object} res - The response object.
@throws {401} - If the user is not authenticated.
@throws {500} - If there is an error editing the workplace.
@throws {400} - If the validation of the request body fails.
@description Handles the edition of a workplace.
*/
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