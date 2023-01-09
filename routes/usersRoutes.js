const express = require("express");
const router = express.Router();
const path = require("path");
var User = require("../models/usersModel");

router.get("/jobOffers", function (req, res) {
    res.send([
        {
            _id: 1,
            title: "Programmer",
            company: "Ernst Young",
            salary: 13000,
            duration: "12 months",
            until_date: new Date(2022, 11, 31),
            description: "The ideal candidate is a JS programmer who is able to make effective decisions quickly.",
            creation_date: new Date(2022, 10, 22),
            work_type: "Full-Time",
            area: "Consultancy"
        },
        {
            _id: 2,
            title: "Team Leader",
            company: "KPMG",
            salary: 11000,
            duration: "6 months",
            until_date: new Date(2023, 3, 25),
            description: "Our client is looking for a 5+ years Team Leader experience, taking products from prototype to commercialization, with a solid emphasis on the test cycle.",
            creation_date: new Date(2022, 10, 18),
            work_type: "Full-Time",
            area: "Finance"
        },
        {
            _id: 3,
            title: "Developer",
            company: "Deloitte",
            salary: 9500,
            duration: "6 months",
            until_date: new Date(2023, 6, 1),
            description: "We're looking for a Computer Science student with basic software skills.",
            creation_date: new Date(2022, 10, 10),
            work_type: "Part-Time",
            area: "Audit"
        },
        {
            _id: 4,
            title: "Consultant",
            company: "Deloitte",
            salary: 16000,
            duration: "48 months",
            until_date: new Date(2023, 6, 1),
            description: "We're looking for a Computer Science student with basic software skills.",
            creation_date: new Date(2022, 10, 10),
            work_type: "Part-Time",
            area: "Consultancy"
        },
        {
            _id: 5,
            title: "Manager",
            company: "KPMG",
            salary: 19000,
            duration: "36 months",
            until_date: new Date(2023, 6, 1),
            description: "We're looking for a Computer Science student with basic software skills.",
            creation_date: new Date(2022, 10, 10),
            work_type: "Full-Time",
            area: "Audit"
        },
        {
            _id: 6,
            title: "Data Analyst",
            company: "KPMG",
            salary: 19000,
            duration: "36 months",
            until_date: new Date(2023, 6, 1),
            description: "We're looking for a Computer Science student with basic software skills.",
            creation_date: new Date(2022, 10, 10),
            work_type: "Full-Time",
            area: "IT"
        }
    ])
});

router.post("/auth", function (req, res) {
    let email = req.body.email;
	let pass = req.body.password;
    if (!email || !pass) {
        res.sendStatus(401);
    }
    User.verifyUser(email, pass, function(err, isVerified) {
        if (err) {
            res.send(500);
        } else if (!isVerified) {
            res.sendStatus(401);
        } else {
            req.session.authenticated = true;
            req.session.user = {
                email: email,
                type: "job_seeker"
            }
			res.sendStatus(200);
        }
    })
});

router.post("/register", function (req, res) {
    let userInfo = [
        req.body.email,
        req.body.password,
        req.body.type,
        req.body.description
    ]

    if (req.body.type === 'job_seeker') {
        let jobSeekerInfo = [
            req.body.name,
            req.body.birthDate,
            req.body.location,
            req.body.isVisible
        ]
    } else {
        let headHunterInfo = [
            req.body.companyName,
            req.body.websiteUrl,
            req.body.logoUrl,
        ]
    }



    let user = new User();
    let connection = user.getDbCon();
    connection.query('INSERT INTO users (type, user_description, email, pass) VALUES ?', userInfo, function(error, results, fields) {
        if (error) {
            res.sendStatus(500);
        } else if (results.length === 0) {
            res.sendStatus(401);
        } else {
            req.session.loggedin = true;
			req.session.email = email;
			res.status(200).send("Authenticated successfully");
        }
    });
    connection.end();
    

});

/* router.all("*", function (req, res, next) {
    if (!req.session.loggedin) {
        res.status(401).send(`Unauthorized`);
    }
    next();
}); */

router.get("/users", function (req, res) {
    User.getUsers(function(err, users) {
        if (err) {
            res.status(404).send(err);
        } else if (users.length === 0) {
            res.status(404).send(`Model "users" has no data`);
        } else {
            res.json({ users: users });
        }
    });
});

router.get("/users/:id", function (req, res) {
    const id = req.params.id;
    User.getUser(id, function(err, user) {
        if (err) {
            res.status(404).send(err);
        } else if (!user) {
            res.status(404).send(`User not found`);
        } else {
            res.json({ user: user });
        }
    });
});

router.get("/check-authentication", function (req, res) {
    if (req.session.authenticated) {
        res.json(session);
      } else {
        res.send({authenticated : false});
      }
});

module.exports = router;