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

    /**
    * Executes a query on the database
    *
    * @function
    * @param {string} sql - The sql query
    * @param {Array} params - The query parameters
    * @param {Function} callBack - The callback function to be called with the query result or error
    *
    */
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

    /**
     * Obtains all users from the database
     * @functiom
     * @param {function} callBack - Callback function to handle the result
     */
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

    /**
     * Obtains a user by id from the database
     * @function
     * @param {Number} id - The id of the user to retrieve
     * @param {function} callBack - Callback function to handle the result
     */
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

    /**
     * Obtains a user by email from the database
     * @function
     * @param {String} email - The email of the user to retrieve
     * @param {function} callBack - Callback function to handle the result
     */
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

    /**
    @param {string} key - the user key
    @param {function} callBack - callback function to handle the result of the query
    This function is used to retrieve a user by its key. It makes a query to the users table
    and maps the result to a new User object. If there is an error in the query, it is passed to the callback function.
    If there are no results, it returns null.
    */
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

    /**
    *
    @function
    @param {Object} data - an object contains user data
    @param {string} data.name - the user's name
    @param {string} data.user_type - the user's type
    @param {string} data.description - the user's description
    @param {string} data.email - the user's email
    @param {string} data.password - the user's password
    @param {function} callBack - function that handles the response
    This function is used to create a new user in the database. It takes in the user's data, hashes the password, generates a random key and inserts the data into the "users" table.
    */
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

    /**
    @function
    @param {Object} data - An object containing the data to be used to update the user.
    @param {string} data.name - The name of the user.
    @param {string} data.description - A short description of the user.
    @param {string} data.email - The email of the user.
    @param {string} [data.password] - The new password of the user.
    @param {string} data.userKey - The unique key of the user.
    @param {function} callBack - The function to call after the query has been executed.
    */
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

    /**
    @function
    @param {string} email - Email of the user
    @param {string} pass - plain text password
    @param {function} callBack - callback function
    @description This function is used to check if the user exists and the password is correct
    */
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

    /**
    @function
    @param {number} id - The id of the user to be deleted
    @param {function} callBack - The callback function to be called after the deletion
    @description This function deletes a user from the database with the given id.
    */
    static deleteUser(id, callBack) {
        const params = [id];
        const sql = "delete from users where user_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = User;