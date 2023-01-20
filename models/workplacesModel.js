const connection = require("../config/connection")
const { body, validationResult } = require('express-validator');

/**
 * 
 */
class Workplace {

    constructor(obj) {
        this.id = obj.workplace_id;
        this.jobSeekerId = obj.job_seeker_id;
        this.name = obj.workplace_name;
        this.logoUrl = obj.logo_url;
        this.startDate = obj.start_date;
        this.endDate = obj.end_date;
        this.functionDescription = obj.function_description;
    }

    convertObject(obj) {
        this.workplace_id = obj.id;
        this.workplace_name = obj.name;
        this.logo_url = obj.logoUrl;
        this.start_date = obj.startDate;
        this.end_date = obj.endDate;
        this.function_description = obj.functionDescription;
    }

    /**
    * @function queryDb
    * @param {string} sql - The sql query
    * @param {Array} params - The query parameters
    * @param {Function} callBack - The callback function to be called with the query result or error
    * @throws Will throw an error if the provided sql or params is not valid.
    * @returns {void}
    * @description Executes a query on the database
    * @memberof Workplace
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
    @function getWorkplaces
    @param {function} callBack - The callback function to handle the query result.
    @returns {Array} Array of all workplaces in the table.
    @throws {Error} If there is an error with the query or no data found in table.
    @description Retrieves all workplaces from the table.
    @memberof Workplace
    */
    static getWorkplaces(callBack) {
        const sql = "SELECT * FROM workplaces";
        this.queryDb(sql, [], function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(new Error(`No data found on table "workplaces"`), null);
            } else {
                callBack(null, result.map(workplace => new Workplace(workplace)));
            }
        });
    }

    /**
    @function getWorkplace
    @param {number} id - The id of the workplace.
    @param {function} callBack - The callback function that will be called after the query to the database is finished.
    @returns {Workplace} - An instance of the Workplace class.
    @throws {Error} - If there's an error with the query or no data is found.
    @memberof Workplace
    @description This function makes a query to the database to get a specific workplace by its id.
    */
    static getWorkplace(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM workplaces WHERE workplace_id = ?";
        this.queryDb(sql, params, function(err, result) {
            let workplace = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, workplace ? new Workplace(workplace) : null);
            }
        });
    }

    /**
    @function getWorkplacesUser
    @param {Number} id - The id of the user associated with the workplaces
    @param {function} callBack - The callback function to handle the query result.
    @returns {Array} Array of all workplaces associated with the user with the provided id.
    @throws {Error} If there is an error with the query or no workplaces associated to the user.
    @description Retrieves all workplaces associated with a specific user by id.
    @memberof Workplace
    */
    static getWorkplacesUser(id, callBack) {
        const params = [id];
        const sql = "SELECT * FROM workplaces where job_seeker_id = ?";
        this.queryDb(sql, params, function(err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                //callBack(new Error(`The user has no Workplaces associated to him`), null);
                callBack(null, []);
            } else {
                callBack(null, result.map(workplace => new Workplace(workplace)));
            }
        });
    }

    /**
    @function createWorkplace
    @param {Object} data - The data of the workplace to be created.
    @param {String} data.name - The name of the workplace.
    @param {String} data.logoUrl - The logo URL of the workplace.
    @param {String} data.startDate - The start date of the workplace.
    @param {String} data.endDate - The end date of the workplace.
    @param {String} data.functionDescription - The function description of the workplace.
    @param {Number} data.jobSeekerId - The id of the job seeker associated with the workplace.
    @param {function} callBack - The callback function to handle the query result.
    @returns {void}
    @throws {Error} if there is an error with the query.
    @description Creates a new workplace in the database with the provided data.
    @memberof Workplace
*/
    static createWorkplace(data, callBack) {
        //const workplaceData = JSON.parse(jsonData);
        const params = [data.name, data.logoUrl, data.startDate, 
            data.endDate, data.functionDescription, data.jobSeekerId];
        const sql = "insert into workplaces (workplace_name, logo_url, start_date, end_date, function_description, job_seeker_id) values (?, ?, ?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    /**
    * @function editWorkplace
    * @param {Object} workplace - An object containing the workplace information
    * @property {string} workplace.name - The name of the workplace
    * @property {string} workplace.logoUrl - The URL of the workplace's logo
    * @property {string} workplace.startDate - The start date of the workplace
    * @property {string} workplace.endDate - The end date of the workplace
    * @property {string} workplace.functionDescription - The function description of the workplace
    * @property {number} workplace.jobSeekerId - The ID of the job seeker
    * @property {number} workplace.id - The ID of the workplace
    * @param {function} callBack - The callback function that will be called after the query is executed
    * @returns {void}
    * @throws {Error} if there is an error with the query.
    * @memberof Workplace
    * @description Updates an existing workplace in the database
    * 
*/
    static editWorkplace(workplace, callBack) {
        const params = [
            workplace.name,
            workplace.logoUrl,
            workplace.startDate,
            workplace.endDate,
            workplace.functionDescription,
            workplace.jobSeekerId,
            workplace.id];
        const sql = "UPDATE workplaces SET workplace_name = ?, logo_url = ?, start_date = ?, end_date = ?, function_description = ?, job_seeker_id = ? WHERE workplace_id = ?";
        this.queryDb(sql, params, callBack);
    }

    /**
    * @function deleteWorkplace
    * @param {number} id - The ID of the workplace to be deleted
    * @param {function} callBack - The callback function that will be called after the query is executed
    * @returns {void}
    * @throws {Error} if there is an error with the query.
    * @memberof Workplace
    * @description Deletes an existing workplace from the database
    * 
    */
    static deleteWorkplace(id, callBack) {
        const params = [id];
        const sql = "delete from workplaces where workplace_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = Workplace;