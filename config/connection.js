// conectar à DB
let connect = function() {
    const mysql = require('mysql');
    const mysqlCon = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "123456",
        database: "orange"
    });
    mysqlCon.connect(function (err) {
        if (err) {
            console.log(err.message);
        }
    });
    return mysqlCon;
}

module.exports = connect;