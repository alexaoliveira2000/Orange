class User {

    // conectar à DB
    getDbCon() {
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

    // fazer uma query recebida como argumento
    queryDb(sql, params, callBack) {
        const mysqlCon = this.getDbCon();
        mysqlCon.query(sql, params, function (err, result) {
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, result);
            }
        });
        mysqlCon.end();
    }

    // devolver todos os utilizadores
    getUsers(callBack) {
        const sql = "SELECT * FROM users";
        this.queryDb(sql, [], callBack);
    }

    // devolver um utilizador
    getUser(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM users WHERE user_id = ?";
        this.queryDb(sql, params, callBack);
    }

    // criar um utilizador
    createUser(jsonData, callBack) {
        const userData = JSON.parse(jsonData);
        const bcrypt = require('bcrypt');
        const passwordHash = bcrypt.hashSync(userData.pwd, 10);
        const params = [userData.first_name, userData.last_name, userData.username, passwordHash];
        const sql = "insert into system_users (first_name, last_name, username, pwd) values (?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // criar um utilizador
    createUser(jsonData, callBack) {
        const userData = JSON.parse(jsonData);
        const bcrypt = require('bcrypt');
        const passwordHash = bcrypt.hashSync(userData.pwd, 10);
        const params = [userData.first_name, userData.last_name, userData.username, passwordHash];
        const sql = "insert into system_users (first_name, last_name, username, pwd) values (?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // verificar user e pass dos formulários
    verifyUser(username, password, callBack) {
        const bcrypt = require('bcrypt');
        const sql = "select * from system_users where username = ?";
        const params = [username];
        this.queryDb(sql, params, function (err, result) {
            if (err) {
                callBack(err, false);
            } else {
                if (result.length == 0) {
                    callBack(new Error("Invalid username."), null);
                } else {
                    var hashedPassword = result[0].pwd;
                    var response = bcrypt.compareSync(password, hashedPassword);
                    if (response == false) {
                        callBack(new Error("Password verification failed."), null);
                    } else {
                        callBack(null, result);
                    }
                }
            }
        });
    }
}

module.exports = User;