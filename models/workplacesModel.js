const connection = require("../config/connection")
const { body, validationResult } = require('express-validator');

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
    @function
    @static
    Executes a query to the database using the provided SQL statement and parameters.
    @param {string} sql - The SQL statement to be executed.
    @param {object} params - The parameters to be used in the SQL statement.
    @param {function} callBack - The callback function to be executed after the query is complete. The first parameter is an error object (if any) and the second parameter is the result of the query.
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
    @function
    @static
    @async
    This function queries the database and retrieves all the workplaces.
    @param {function} callBack - A callback function to handle the results of the query, it takes an error as first parameter and the result, if any, as the second.
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
    @function
    @async
    @param {number} id - The id of the workplace.
    @param {function} callBack - The callback function that will be called after the query to the database is finished.
    @returns {Workplace} - An instance of the Workplace class.
    @throws {Error} - If there's an error with the query or no data is found.
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
    This function is used to get all the workplaces associated with a user by user's ID
    @function
    @param {number} id - The ID of the user whose workplaces are to be retrieved
    @param {function} callBack - The callback function that will be called when the data is retrieved. It will receive two parameters: an error object and the data retrieved.
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
    * Creates a workplace in the database
    * 
    @static
    @function createWorkplace
    @param {Object} data - An object containing the new workplace data.
    @param {string} data.name - The name of the workplace.
    @param {string} data.logoUrl - The url of the workplace logo.
    @param {string} data.startDate - The start date of the workplace.
    @param {string} data.endDate - The end date of the workplace.
    @param {string} data.functionDescription - The function description of the workplace.
    @param {string} data.jobSeekerId - The job seeker id associated to the workplace.
    @param {function} callBack - A callback function that will be called after the query.
    */
    static createWorkplace(data, callBack) {
        //const workplaceData = JSON.parse(jsonData);
        const params = [data.name, data.logoUrl, data.startDate, 
            data.endDate, data.functionDescription, data.jobSeekerId];
        const sql = "insert into workplaces (workplace_name, logo_url, start_date, end_date, function_description, job_seeker_id) values (?, ?, ?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    /**
    * Updates an existing workplace in the database
    *
    * @static
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
    * Deletes an existing workplace from the database
    *
    * @static
    * @function deleteWorkplace
    * @param {number} id - The ID of the workplace to be deleted
    * @param {function} callBack - The callback function that will be called after the query is executed
    * 
    */
    static deleteWorkplace(id, callBack) {
        const params = [id];
        const sql = "delete from workplaces where workplace_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = Workplace;