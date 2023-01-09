const connection = require("../config/connection")
const bcrypt = require("bcrypt")

class User {

    constructor(obj) {
        this.id = obj.user_id;
        this.type = obj.user_type;
        this.description = obj.user_description;
        this.email = obj.email;
        this.password = obj.pass;
    }

    isAdmin() {
        return this.type === 'admin';
    }

    // devolver uma query recebida como argumento (em json)
    static queryDb(sql, params, callBack) {
        const mysqlCon = connection();
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
        User.queryDb(sql, [], function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(new Error(`No data found on table "users"`), null);
            } else {
                callBack(null, result.map(user => new User(user)));
            }
        });
    }

    // devolver um User (passar de json para User)
    static getUser(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM users WHERE user_id = ?";
        User.queryDb(sql, params, function(err, result) {
            let user = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, user ? new User(user) : null);
            }
        });
    }

    // criar um utilizador
    static createUser(jsonData, callBack) {
        const userData = JSON.parse(jsonData);
        const passwordHash = bcrypt.hashSync(userData.pwd, 10);
        const params = [userData.first_name, userData.last_name, userData.username, passwordHash];
        const sql = "insert into system_users (first_name, last_name, username, pwd) values (?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // validar email e pass do formulário
    static verifyUser(email, pass, callBack) {
        const bcrypt = require('bcrypt');
        const sql = "SELECT * FROM users WHERE email = ?";
        const params = [email];
        this.queryDb(sql, params, function (err, result) {
            if (err) {
                callBack(err, false);
            } else {
                if (result.length == 0) {
                    callBack(null, false);
                } else {
                    var hashedPassword = result[0].pwd;
                    var response = bcrypt.compareSync(pass, hashedPassword);
                    if (!response) {
                        callBack(null, false);
                    } else {
                        callBack(null, true);
                    }
                }
            }
        });
    }
}

module.exports = User;