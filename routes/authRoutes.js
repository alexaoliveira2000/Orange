const express = require("express");
const router = express.Router();
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { body, validationResult } = require('express-validator');

/* router.post('/auth', function (req, res) {
    const url = `http://${req.headers.host}/api/auth`
    axios.post(url, { email: req.body.email, password: req.body.password })
        .then(response => {
            res.redirect("/");
        })
        .catch(error => {
            res.redirect("/login");
        });
}); */

/* router.post('/register',
    body('user_type').trim().isIn(['job_seeker', 'headhunter']),
    function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        } else {
            let type = req.body.user_type;
            const url = `http://${req.headers.host}/api/users/${type}`
            axios.post(url, req.body)
                .then(response => {
                    res.redirect("/login");
                })
                .catch(error => {
                    res.redirect("/signup");
                });
        }
    }); */

/* router.post('/signout', function (req, res) {

}); */

router.get('/', function (req, res) {
    res.redirect("/index");
});

router.get("/profile", function (req, res) {
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }
    res.redirect(`profile/${req.session.user.key}`);
})

router.get("/profile/:key", function (req, res, next) {
    console.log("mandou:" + req.params.key)
    if(!req.session.authenticated) {
        res.sendStatus(401);
    }
    let isKey = !req.params.key.includes(".");
    let filePath = isKey ? path.join(__dirname, '../www/', "profile.html") : null;
    if (isKey && hasPermission(req.session, path.basename(filePath))) {
        res.sendFile(filePath);
    } else if (!isKey) {
        res.sendFile(path.join(__dirname, '../www/', "notfound.html"));
    } else {
        res.sendFile(path.join(__dirname, '../www/', "unauthorized.html"));
    }
    return;
})

/* router.get("/profile/*", function (req, res, next) {
    let file = req.url.substring(1);
    file = file.substring(file.indexOf('/') + 1);
    let filePath = path.join(__dirname, '../www/', file);
    console.log("url: " + filePath)
    console.log(file);
    try {
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
            if (fs.existsSync(filePath)) {
                if (hasPermission(req.session, path.basename(filePath))) {
                    res.sendFile(filePath);
                    return;
                  } else {
                    res.sendFile(path.join(__dirname, '../www/', "unauthorized.html"));
                    return;
                  }
            } else {
                next();
            }
        } else {
          res.status(404).send('Não é um arquivo');
        }
      } catch (err) {
        res.status(404).send('Arquivo não encontrado');
      }
}); */

router.get('/:page', function (req, res, next) {
    let page = req.params.page;
    let isHtml = page.includes("html") || !page.includes(".");
    let filePath;
    if (isHtml) {
        filePath = path.join(__dirname, '../www/', page.split(".")[0] + '.html');
    } else {
        filePath = path.join(__dirname, '../www/', page);
    }
    if (fs.existsSync(filePath)) {
        if (isHtml && hasPermission(req.session, path.basename(filePath))) {
            res.sendFile(filePath);
        } else {
            //res.sendStatus(401);
            res.sendFile(path.join(__dirname, '../www/', "unauthorized.html"));
        }
    } else {
        next();
    }
});

let hasPermission = function(session, page) {
    if (page === "index.html") {
        return true;
    }
    if (page === "about-us.html") {
        return true;
    }
    if (page === "login.html") {
        return !session.authenticated;
    }
    if (page === "signup.html") {
        return !session.authenticated;
    }

    if (!session.authenticated) return false;

    if (session.user.type === "admin") return true;

    if (page === "profile.html") {
        return true;
    }
    if (page === "friends.html") {
        return true;
    }
    if (page === "job-offers.html") {
        return session.user.type === "job_seeker";
    }
    if (page === "resumes.html") {
        return session.user.type === "headhunter";
    }
    return false;
}

module.exports = router;