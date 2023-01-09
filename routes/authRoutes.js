const express = require("express");
const router = express.Router();
const axios = require("axios");
const path = require("path");
const fs = require("fs");

router.post('/auth', function (req, res) {
    const url = `http://${req.headers.host}/api/auth`
    axios.post(url, { email: req.body.email, password: req.body.password })
        .then(response => {
            res.redirect("/www/index.html");
        })
        .catch(error => {
            res.redirect("/www/login.html");
        });
});

router.get('/', function (req, res) {
    res.redirect("/index");
});

router.get('/:page', function (req, res) {
    let page = req.params.page;
    let isHtml =  page.includes("html") || !page.includes(".");
    let filePath;
    if (isHtml) {
        filePath = path.join(__dirname, '../www/', page.split(".")[0] + '.html');
    } else {
        filePath = path.join(__dirname, '../www/', page);
    }
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;