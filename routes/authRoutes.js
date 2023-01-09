const express = require("express");
const router = express.Router();
const axios = require("axios");
const path = require("path");
const fs = require("fs");

// se não estiver logado, redirecionar para a página de login
/* router.get('*', function(req, res, next) {
    let extension = path.extname(req.url);
    if(!req.session.loggedin) {
        if ((extension === "" || extension === ".html") && req.url !== '/www/login.html' && req.url !== '/www/signup.html') {
            res.redirect("/www/login.html");
        }
    }
    next();
}); */

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
    console.log(page)
    
    if (isHtml) {
        page = page.split(".")[0];
        filePath = path.join(__dirname, '../../www/', page, 'html');
    } else {
        filePath = path.join(__dirname, '../../www/', page);
    }
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    }

});




module.exports = router;