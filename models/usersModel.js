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
    * @function queryDb
    * @param {string} sql - The sql query
    * @param {Array} params - The query parameters
    * @param {Function} callBack - The callback function to be called with the query result or error
    * @throws Will throw an error if the provided sql or params is not valid.
    * @returns {void}
    * @description Executes a query on the database
    * @memberof User
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
    @function getUsers
    @param {function} callBack - The callback function to handle the query result.
    @returns {Array} Array of all Users in the table.
    @throws {Error} If there is an error with the query.
    @description Retrieves all Users from the table.
    @memberof User
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
    @function getUser
    @memberof User
    @description Retrieves a user from the database based on the provided user ID.
    @param {number} id - The ID of the user to retrieve.
    @param {function} callBack - The callback function to execute after the query has been completed. The function will receive two parameters: an error object and the retrieved user.
    @throws Will throw an error if the provided user ID is not a number.
    @returns {void}
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
    @function getUserByEmail
    @memberof User
    @description Retrieves a user from the database based on the provided email.
    @param {string} email - The email of the user to retrieve.
    @param {function} callBack - The callback function to execute after the query has been completed. The function will receive two parameters: an error object and the retrieved user.
    @throws Will throw an error if the provided email is not a string.
    @returns {void}
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
    @function getUserByKey
    @memberof User
    @description Retrieves a user from the database based on the provided key.
    @param {string} key - The key of the user to retrieve.
    @param {function} callBack - The callback function to execute after the query has been completed. The function will receive two parameters: an error object and the retrieved user.
    @throws Will throw an error if the provided key is not a string.
    @returns {void}
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
    @function createUser
    @memberof User
    @description Creates a new user in the database with the provided data.
    @param {Object} data - An object containing the following properties: name, user_type, description, email, password.
    @param {function} callBack - The callback function to execute after the query has been completed. The function will receive one parameter: an error object
    @throws Will throw an error if the provided data object does not contain the required properties or invalid properties.
    @returns {void}
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
    @function editUser
    @memberof User
    @description Edits a user in the database with the provided data.
    @param {Object} data - An object containing the following properties: name, description, email, password, and userKey.
    @param {function} callBack - The callback function to execute after the query has been completed. The function will receive one parameter: an error object
    @throws Will throw an error if the provided data object does not contain the required properties or invalid properties.
    @returns {void}
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
    @function verifyUser
    @memberof User
    @description Verify a user's email and password.
    @param {string} email - The email of the user to verify.
    @param {string} pass - The password of the user to verify.
    @param {function} callBack - The callback function to execute after the query has been completed. The function will receive two parameters: an error object and the retrieved user or null if the verification failed.
    @throws Will throw an error if the provided email or password is not a string.
    @returns {void}
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
    @function deleteUser
    @memberof User
    @description Deletes a user from the database based on the provided user ID.
    @param {number} id - The ID of the user to delete.
    @param {function} callBack - The callback function to execute after the query has been completed. The function will receive one parameter: an error object
    @throws Will throw an error if the provided user ID is not a number.
    @returns {void}
    */
    static deleteUser(id, callBack) {
        const params = [id];
        const sql = "delete from users where user_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = User;