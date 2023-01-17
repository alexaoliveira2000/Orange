const connection = require("../config/connection")
const bcrypt = require("bcrypt")
const randomString = require('random-string');

class User {

    constructor(obj) {
        this.id = obj.user_id;
        this.name = obj.user_name;
        this.type = obj.user_type;
        this.description = obj.user_description;
        this.email = obj.email;
        this.password = obj.pass;
        this.key = obj.user_key;
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
        User.queryDb(sql, [], function (err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(null, null);
            } else {
                callBack(null, result.map(user => new User(user)));
            }
        });
    }

    // devolver um User (passar de json para User)
    static getUser(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM users WHERE user_id = ?";
        User.queryDb(sql, params, function (err, result) {
            let user = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, user ? new User(user) : null);
            }
        });
    }

    // devolver um User através do email
    static getUserByEmail(email, callBack) {
        const params = [email];
        const sql = "SELECT * FROM users WHERE email = ?";
        User.queryDb(sql, params, function (err, result) {
            let user = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, user ? new User(user) : null);
            }
        });
    }

    // devolver um User atraves da user_key
    static getUserByKey(key, callBack) {
        const params = [key];
        const sql = "SELECT * FROM users WHERE user_key = ?";
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
    static createUser(data, callBack) {
        const passwordHash = bcrypt.hashSync(data.password, 10);
        const params = [
            data.name,
            data.user_type,
            data.description,
            data.email,
            passwordHash,
            randomString({ length: 30 })
        ];
        const sql = "insert into users (user_name, user_type, user_description, email, pass, user_key) values (?, ?, ?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    // editar um utilizador
    static editUser(data, callBack) {
        let params = "",
            sql = "";

        if(data.password) {
            const passwordHash = bcrypt.hashSync(data.password, 10);
            params = [
                data.name,
                data.description,
                data.email,
                passwordHash,
                data.userKey
            ];
            sql = "UPDATE users SET user_name = ?, user_description = ?, email = ?, pass = ? WHERE user_key = ?";
        } else {
            params = [
                data.name,
                data.description,
                data.email,
                data.userKey
            ];
            sql = "UPDATE users SET user_name = ?, user_description = ?, email = ? WHERE user_key = ?";
        }

        this.queryDb(sql, params, callBack);
    }

    // validar email e pass do formulário
    static verifyUser(email, pass, callBack) {
        const bcrypt = require('bcrypt');
        const sql = "SELECT * FROM users WHERE email = ?";
        const params = [email];
        this.queryDb(sql, params, function (err, user) {
            if (err) {
                callBack(err, false);
            } else {
                if (user.length == 0) {
                    callBack(null, null);
                } else {
                    var hashedPassword = user[0].pass;
                    var response = bcrypt.compareSync(pass, hashedPassword);
                    if (!response) {
                        callBack(null, null);
                    } else {
                        callBack(null, new User(user[0]));
                    }
                }
            }
        });
    }

    // eliminar um User
    static deleteUser(id, callBack) {
        const params = [id];
        const sql = "delete from users where user_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = User;