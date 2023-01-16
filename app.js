const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

app.set("hostname", "localhost");
app.set("port", 3000);

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/:page.html", (req, res) => res.redirect(req.params.page));
app.use(express.static(path.join(__dirname,"www")));
app.use('/', require("./routes/authRoutes"));
app.use('/api/', require("./routes/apiRoutes"));
app.use('/api/users/', require("./routes/usersRoutes"));
app.use('/api/profile/', require("./routes/profileRoutes"));
app.use('/api/courses/', require("./routes/coursesRoutes"));
app.use('/api/workplaces/', require("./routes/workplacesRoutes"));
app.use('/api/jobOffers/', require("./routes/jobOffersRoutes"));
app.use('/api/resumes/', require("./routes/resumesRoutes"));
app.use('/api/friends/', require("./routes/friendsRoutes"));
app.use((req, res) => res.sendFile(path.join(__dirname, '/www/', "notfound.html")));

app.listen(app.get("port"),
    () => {
        console.log(`\n Server Listening on ${app.get("port")}`)
    });