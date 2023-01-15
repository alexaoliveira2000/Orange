const express = require("express");
const router = express.Router();
const User = require("../models/usersModel");
const JobSeeker = require("../models/jobSeekersModel");
const Friend = require("../models/friendsListModel");
const { body, validationResult } = require('express-validator');

router.get("/:key", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "job_seeker") {
        res.sendStatus(401);
    }
    User.getUserByKey(req.params.key, function (err, user) {
        if (err) {
            res.sendStatus(500);
        } else if (!user) {
            res.sendStatus(400);
        } else {
            Friend.getFriendListUser(user.id, function (err, friends) {
                if (err) {
                    res.sendStatus(500);
                } else if (friends.length === 0) {
                    res.json({ friends: [] });
                } else {
                    let friendsArray = [];
                    friends.forEach(function (friend) {
                        if (!friend.pending) {
                            friendsArray.push(friend.jobSeekerId === user.id ? friend.friendId : friend.jobSeekerId);
                        }
                    });
                    JobSeeker.getJobSeekers(function (err, jobSeekers) {
                        if (err) {
                            res.sendStatus(500);
                        } else if (jobSeekers.length === 0) {
                            res.json({ friends: [] });
                            return;
                        } else {
                            let userFriends = jobSeekers.filter(jobSeeker => friendsArray.includes(jobSeeker.id));
                            res.json({ friends: userFriends });
                            return;
                        }
                    });
                }
            });
        }
    });
});

router.post("/add-friend",
    body("email").trim().isEmail().withMessage("Value is not an email")
        .isLength({ max: 60 }).withMessage("Email is too long")
        .custom(email => email === req.session.user.email).withMessage("You can not add yourself (duh)"),
    function (req, res) {
        if (!req.session.authenticated || req.session.user.type !== "job_seeker") {
            res.sendStatus(401);
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        User.getUserByEmail(req.body.email, function (err1, user) {
            if (err1) {
                res.sendStatus(500);
            } else if (!user) {
                res.status(400).json({
                    errors: [{
                        value: req.body.email,
                        msg: 'There is no user with this email',
                        param: 'email',
                        location: 'body'
                    }]
                });
                return;
            } else if (user.type != "job_seeker") {
                res.status(400).json({
                    errors: [{
                        value: req.body.email,
                        msg: 'This user is not a Job Seeker',
                        param: 'email',
                        location: 'body'
                    }]
                });
                return;
            } else {
                Friend.getFriendship(req.session.user.id, user.id, function (err2, friendship) {
                    if (err2) {
                        res.sendStatus(500);
                    } else if (friendship && !friendship.pending) {
                        res.status(400).json({
                            errors: [{
                                value: req.body.email,
                                msg: "You're already friends with this user",
                                param: 'email',
                                location: 'body'
                            }]
                        });
                        return;
                    } else if (friendship && friendship.pending) {
                        res.status(400).json({
                            errors: [{
                                value: req.body.email,
                                msg: "You already sent a friend request to this user",
                                param: 'email',
                                location: 'body'
                            }]
                        });
                        return;
                    } else {
                        Friend.createFriendList(req.session.user.id, user.id, function (err3, result) {
                            if (err3) {
                                res.sendStatus(500);
                            } else {
                                res.sendStatus(200);
                            }
                        });
                    }
                });



                Friend.removeFriend(req.body.friendKey, req.body.key, function (err, result) {
                    if (err) {
                        res.sendStatus(500);
                    } else {
                        res.sendStatus(200);
                    }
                });
            }
        });
    });

router.post("/remove-friend", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "job_seeker") {
        res.sendStatus(401);
    }
    if (!req.body.friendKey || !req.body.key) {
        res.sendStatus(400);
    }

    User.getUserByKey(req.body.friendKey, function (err, user) {
        if (err) {
            res.sendStatus(500);
        } else if (!user) {
            res.sendStatus(400);
        } else {
            Friend.removeFriend(req.body.friendKey, req.body.key, function (err, result) {
                if (err) {
                    res.sendStatus(500);
                } else {
                    res.sendStatus(200);
                }
            });
        }
    });
});

module.exports = router;