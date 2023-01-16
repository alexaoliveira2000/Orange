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
                    return;
                } else {
                    let friendsArray = [];
                    friends.forEach(function (friend) {
                        if (!friend.pending || (friend.pending && friend.friendId === req.session.user.id)) {
                            friendsArray.push({
                            friendId: friend.jobSeekerId === user.id ? friend.friendId : friend.jobSeekerId,
                            pending: friend.pending
                        });
                        }
                    });
                    JobSeeker.getJobSeekers(function (err, jobSeekers) {
                        if (err) {
                            res.sendStatus(500);
                        } else if (jobSeekers.length === 0) {
                            res.json({ friends: [] });
                            return;
                        } else {
                            let friendsMap = friendsArray.map(f => f.friendId);
                            let userFriends = jobSeekers.filter(jobSeeker => friendsMap.includes(jobSeeker.id));
                            userFriends.forEach(function (friend) {
                                friend.pending = friendsArray.filter(f => f.friendId === friend.id)[0].pending;
                            });
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
    body("email")
        .isEmail().withMessage("Value is not an email")
        .isLength({ max: 60 }).withMessage("Email is too long"),
    function (req, res) {
        if (!req.session.authenticated || req.session.user.type !== "job_seeker") {
            res.sendStatus(401);
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        if (req.body.email === req.session.user.email) {
            res.status(400).json({
                errors: [{
                    value: req.body.email,
                    msg: 'You can not add yourself (duh)',
                    param: 'email',
                    location: 'body'
                }]
            });
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
                    console.log(friendship)
                    //friendship = friendship[0];
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
                                msg: "There's already a pending friend request with this user",
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
            }
        });
    });

router.post("/remove-friend", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "job_seeker") {
        res.sendStatus(401);
    }
    if (!req.body.friendKey) {
        res.sendStatus(400);
    }
    User.getUserByKey(req.body.friendKey, function (err, user) {
        if (err) {
            res.sendStatus(500);
        } else if (!user) {
            res.sendStatus(400);
        } else {
            Friend.getFriendship(req.session.user.id, user.id, function (err, friendship) {
                if (err) {
                    res.sendStatus(500);
                } else if (!friendship) {
                    res.sendStatus(400);
                } else {
                    Friend.removeFriend(req.session.user.id, user.id, function (err, result) {
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

router.post("/accept-friend", function (req, res) {
    if (!req.session.authenticated || req.session.user.type !== "job_seeker") {
        res.sendStatus(401);
    }
    if (!req.body.friendKey) {
        res.sendStatus(400);
    }
    User.getUserByKey(req.body.friendKey, function (err, user) {
        if (err) {
            res.sendStatus(500);
        } else if (!user) {
            res.sendStatus(400);
        } else {
            Friend.getFriendship(req.session.user.id, user.id, function (err, friendship) {
                if (err) {
                    res.sendStatus(500);
                } else if (!friendship) {
                    res.sendStatus(400);
                } else {
                    Friend.acceptFriend(req.session.user.id, user.id, function (err, result) {
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

module.exports = router;