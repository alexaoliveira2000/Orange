const express = require("express");
const router = express.Router();
const axios = require("axios");

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
    res.redirect("/www/index.html");
});

module.exports = router;