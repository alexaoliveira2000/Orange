const connection = require("../config/connection")
const User = require("../models/usersModel");

class Headhunter extends User {

    constructor(obj) {
        super(obj);
        this.headhunter_id = obj.headhunter_id;
        this.logoUrl = obj.website_logo;
        this.websiteUrl = obj.website_url;
        this.validated = obj.validated === 1;
    }

    /**
    * @function queryDb
    * @param {string} sql - The sql query
    * @param {Array} params - The query parameters
    * @param {Function} callBack - The callback function to be called with the query result or error
    * @throws Will throw an error if the provided sql or params is not valid.
    * @returns {void}
    * @description Executes a query on the database
    * @memberof Headhunter
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
    @function getHeadhunters
    @memberof Headhunter
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Retrieves all headhunters from the database and maps them to instances of the Headhunter class, it joins the headhunters and users tables.
    */
    static getHeadhunters(callBack) {
        const sql = "select users.*, headhunters.* from headhunters left join users on users.user_id = headhunters.headhunter_id;"
        this.queryDb(sql, [], function (err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(null, []);
            } else {
                callBack(null, result.map(headhunter => new Headhunter(headhunter)));
            }
        });
    }

    /**
    @function getHeadhunter
    @memberof Headhunter
    @param {number} id - The id of the headhunter to retrieve.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Retrieves a specific headhunter from the database by its id and maps it to an instance of the Headhunter class.
    */
    static getHeadhunter(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM headhunters WHERE headhunter_id = ?";
        this.queryDb(sql, params, function (err, result) {
            let headhunter = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, headhunter ? new Headhunter(headhunter) : null);
            }
        });
    }

    /**
    @function createHeadhunter
    @memberof Headhunter
    @param {number} userId - The id of the user who is going to be a headhunter
    @param {Object} data - The data of the headhunter to create.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Creates a new headhunter in the database using the user's id and passed data with validated status of 0.
    */
    static createHeadhunter(userId, data, callBack) {
        const params = [
            userId,
            data.website,
            data.logo,
        ];
        const sql = "insert into headhunters (headhunter_id, website_url, website_logo, validated) values (?, ?, ?, 0)";
        this.queryDb(sql, params, callBack);
    }

    /**
    @function acceptHeadhunter
    @memberof Headhunter
    @param {number} id - The id of the headhunter to accept.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Accepts a headhunter by updating the validated status of the headhunter to 1.
    */
    static acceptHeadhunter(id, callBack) {
        const params = [id];
        const sql = "UPDATE headhunters SET validated = 1 WHERE headhunter_id = ?";
        this.queryDb(sql, params, callBack);
    }

    /**
    @function editHeadhunter
    @memberof Headhunter
    @param {Object} headhunter - The headhunter data to update.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Updates a headhunter in the database using the passed headhunter data.
    */
    static editHeadhunter(headhunter, callBack) {
        const params = [
            headhunter.logoUrl,
            headhunter.websiteUrl,
            headhunter.id];
        const sql = "UPDATE headhunters SET website_url = ?, website_logo = ?, validated = ? WHERE headhunter_id = ?";
        this.queryDb(sql, params, callBack);
    }

    /**
    @function deleteHeadhunter
    @memberof Headhunter
    @param {number} id - The id of the headhunter to delete.
    @param {function} callBack - The callback function to handle the results of the query.
    @returns {void}
    @throws {Error} Will throw an error if there is a problem with the query or callback.
    @description Deletes a specific headhunter from the database by its id.
    */
    static deleteHeadhunter(id, callBack) {
        const params = [id];
        const sql = "delete from headhunters where headhunter_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }

}

module.exports = Headhunter;