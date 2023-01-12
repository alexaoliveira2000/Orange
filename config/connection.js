// conectar à DB
let connect = function() {
    const mysql = require('mysql');
    const mysqlCon = mysql.createConnection({
        host: "78.137.238.60",
        user: "alex",
        password: ":T$sC64a",
        database: "alexpw"
    });
    mysqlCon.connect(function (err) {
        if (err) {
            console.log(err.message);
        }
    });
    return mysqlCon;
}

module.exports = connect;