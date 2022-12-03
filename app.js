var express = require('express')
var path = require('path')
var app = express()

app.set("port", 3000);

//Serving statics files
app.use(express.static(path.join(__dirname, 'www')))

require("./routes/usersRoutes")(app)

app.listen(app.get("port"),
    () => {
        console.log(`\n  Server Listening on ${app.get("port")}`)
    });