let connection = require("../config/connection")

class User {

    constructor(obj) {
        this.id = obj.id;
        this.type = obj.type;
        this.description = obj.description;
        this.email = obj.email;
        this.password = obj.password;
    }

    isAdmin() {
        return this.type === 'admin';
    }

    // devolver uma query recebida como argumento (em json)
    queryDb(sql, params, callBack) {
        const mysqlCon = connection.connect();
        mysqlCon.query(sql, params, function (err, result) {
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, result);
            }
        });
        mysqlCon.end();
    }

    // devolver todos os Users (passar de json para User[])
    static getUsers(callBack) {
        const sql = "SELECT * FROM users";
        this.queryDb(sql, [], function(err, users) {
            if (err) {
                callBack(err, null);
            } else if (users.length === 0) {
                callBack(new Error(`No data found on table "users"`), null);
            } else {
                callBack(null, users.map(user => new User(user)));
            }
        });
    }

    // devolver um User (passar de json para User)
    static getUser(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM users WHERE user_id = ?";
        this.queryDb(sql, params, function(err, user) {
            if (err) {
                callBack(err, null);
            } else if (!user) {
                callBack(new Error(`User with id "${id}" not found`), null);
            } else {
                callBack(null, new User(user));
            }
        });
    }

    // criar um utilizador
    static createUser(jsonData, callBack) {
        const userData = JSON.parse(jsonData);
        const bcrypt = require('bcrypt');
        const passwordHash = bcrypt.hashSync(userData.pwd, 10);
        const params = [userData.first_name, userData.last_name, userData.username, passwordHash];
        const sql = "insert into system_users (first_name, last_name, username, pwd) values (?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // validar email e pass do formulário
    static verifyUser(email, password, callBack) {
        const bcrypt = require('bcrypt');
        const sql = "SELECT * FROM users WHERE email = ?";
        const params = [email];
        this.queryDb(sql, params, function (err, result) {
            if (err) {
                callBack(err, false);
            } else {
                if (result.length == 0) {
                    callBack(new Error("Invalid username."), null);
                } else {
                    var hashedPassword = result[0].pwd;
                    var response = bcrypt.compareSync(password, hashedPassword);
                    if (!response) {
                        callBack(new Error("Invalid password."), null);
                    } else {
                        callBack(null, result);
                    }
                }
            }
        });
    }
}

module.exports = User;