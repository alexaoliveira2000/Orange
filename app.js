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
app.use('/api/', require("./routes/usersRoutes"));
app.use('/', require("./routes/authRoutes"));
app.use(express.static(path.join(__dirname), { extensions: ['html'] }));
//app.use("/","/www/");

app.listen(app.get("port"),
    () => {
        console.log(`\n Server Listening on ${app.get("port")}`)
    });