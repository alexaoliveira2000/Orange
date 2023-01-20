const connection = require("../config/connection")
const User = require("../models/usersModel");

class JobSeeker extends User {

    constructor(obj) {
        super(obj);
        this.job_seeker_id = obj.job_seeker_id;
        this.gender = obj.gender;
        this.birthDate = obj.birth_date;
        this.location = obj.location;
        this.isVisibleToCompanies = obj.visible_to_companies;
        this.coursesCount = obj.courses_count || 0;
        this.workplacesCount = obj.workplaces_count || 0;
    }

    /**
    * @function queryDb
    * @param {string} sql - The sql query
    * @param {Array} params - The query parameters
    * @param {Function} callBack - The callback function to be called with the query result or error
    * @throws Will throw an error if the provided sql or params is not valid.
    * @returns {void}
    * @description Executes a query on the database
    * @memberof JobSeeker
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
    @function getJobSeekers
    @param {function} callBack - The callback function which will be called after the query execution.
    @returns {Array} Array of job seekers.
    @throws {Error} if there is an error with the query.
    @description This function retrieve all job seekers from the database.
    @memberof JobSeeker
    */
    static getJobSeekers(callBack) {
        const sql = "select users.*, job_seekers.* from job_seekers left join users on users.user_id = job_seekers.job_seeker_id;";
        this.queryDb(sql, [], function (err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(null, null);
            } else {
                callBack(null, result.map(jobSeeker => new JobSeeker(jobSeeker)));
            }
        });
    }

    /**
    @function getResumes
    @param {Object} filters - The filters to apply on the query.
    @param {Number} filters.minAge - The minimum age of job seekers.
    @param {Number} filters.maxAge - The maximum age of job seekers.
    @param {String|Array} filters.location - The location of job seekers.
    @param {function} callBack - The callback function to handle the query result.
    @returns {Array} Array of job seekers matching the filters.
    @throws {Error} if there is an error with the query.
    @description Retrieves all resumes of job seekers matching the filters provided.
    @memberof JobSeeker
    */
    static getResumes(filters, callBack) {
        let buildWhereClause = function (filters) {
            if (Object.keys(filters).length === 0) {
                return "";
            }
            let conditions = "WHERE";
            let isFirst = true;
            if (filters.minAge) {
                isFirst = false;
                conditions += ` DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), job_seekers.birth_date)), '%Y')+0 >= ${filters.minAge}`;
            }
            if (filters.maxAge) {
                if (isFirst) isFirst = false;
                else conditions += " AND";
                conditions += ` DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), job_seekers.birth_date)), '%Y')+0 <= ${filters.maxAge}`;
            }
            conditions += !isFirst && filters.location ? " AND (" : "";
            if (filters.location) {
                conditions += isFirst ? " (" : "";
                if (Array.isArray(filters.location)) {
                    let isFirstLocation = true;
                    filters.location.forEach(location => {
                        if (isFirstLocation) isFirstLocation = false;
                        else conditions += " OR";
                        conditions += ` job_seekers.location = '${location.replaceAll("%20", " ")}'`;
                    });
                } else {
                    conditions += ` job_seekers.location = '${filters.location.replaceAll("%20", " ")}'`;
                }
            }
            conditions += filters.location ? ")" : "";
            return conditions;
        }
        const sql = `select users.*, job_seekers.*, courses.courses_count, workplaces.workplaces_count, DATE_FORMAT(FROM_DAYS(DATEDIFF(NOW(), job_seekers.birth_date)), '%Y') + 0 AS age
                    from job_seekers
                    join users on users.user_id = job_seekers.job_seeker_id
                    join (	select job_seekers.job_seeker_id as "user_id", count(courses.course_id) as "courses_count"
                            from job_seekers
                            left join courses on courses.job_seeker_id = job_seekers.job_seeker_id
                            group by job_seekers.job_seeker_id ) courses
                    on courses.user_id = job_seekers.job_seeker_id
                    join (	select job_seekers.job_seeker_id as "user_id", count(workplaces.workplace_id) as "workplaces_count"
                            from job_seekers
                            left join workplaces on workplaces.job_seeker_id = job_seekers.job_seeker_id
                            group by job_seekers.job_seeker_id ) workplaces 
                    on workplaces.user_id = job_seekers.job_seeker_id
                    ${buildWhereClause(filters)}
                    group by job_seekers.job_seeker_id;`;
        JobSeeker.queryDb(sql, [], function (err, result) {
            if (err) {
                callBack(err, null);
            } else if (result.length === 0) {
                callBack(null, []);
            } else {
                callBack(null, result.map(user => new JobSeeker(user)));
            }
        });
    }

    /**
    @function getJobSeeker
    @param {Number} id - The id of the job seeker to retrieve.
    @param {function} callBack - The callback function to handle the query result.
    @returns {JobSeeker} The job seeker matching the provided id.
    @throws {Error} if there is an error with the query.
    @description Retrieves a specific job seeker by id.
    @memberof JobSeeker
    */
    static getJobSeeker(id, callBack) {
        const params = [id];
        const sql = `select users.*, job_seekers.* from job_seekers 
                    join users on users.user_id = job_seekers.job_seeker_id 
                    where job_seeker_id = ?;`;
        this.queryDb(sql, params, function (err, result) {
            let jobSeeker = result[0] || null;
            if (err) {
                callBack(err, null);
            } else {
                callBack(null, jobSeeker ? new JobSeeker(jobSeeker) : null);
            }
        });
    }

    /**
    @function createJobSeeker
    @param {Number} userId - The id of the user associated with the job seeker.
    @param {Object} data - The data to create the job seeker.
    @param {String} data.gender - The gender of the job seeker.
    @param {String} data.birth_date - The birth date of the job seeker in the format 'yyyy-mm-dd'.
    @param {String} data.location - The location of the job seeker.
    @param {String} data.visible - A string representation of a boolean indicating whether the job seeker is visible to companies.
    @param {function} callBack - The callback function to handle the query result.
    @returns {void}
    @throws {Error} if there is an error with the query.
    @description Creates a new job seeker by inserting the provided data into the job_seekers table.
    @memberof JobSeeker
    */
    static createJobSeeker(userId, data, callBack) {
        const params = [
            userId,
            data.gender,
            data.birth_date,
            data.location,
            data.visible === 'true'
        ];
        const sql = "insert into job_seekers (job_seeker_id, gender, birth_date, location, visible_to_companies) values (?, ?, ?, ?, ?)";
        this.queryDb(sql, params, callBack);
    }

    /**
    @function editJobSeeker
    @param {Object} data - The data of the job seeker to be updated
    @param {string} data.gender - The gender of the job seeker
    @param {string} data.birthDate - The birth date of the job seeker
    @param {string} data.location - The location of the job seeker
    @param {boolean} data.isVisibleToCompanies - Whether the job seeker's information is visible to companies
    @param {number} data.jobSeekerId - The id of the job seeker to update
    @param {Function} callBack - The function to be executed after the job seeker has been updated
    @returns {void}
    @throws {Error} if there is an error with the query.
    @description This function updates the information of a specific job seeker in the database.
    @memberof JobSeeker
    */
    static editJobSeeker(data, callBack) {
        const params = [
            data.gender,
            data.birthDate,
            data.location,
            data.isVisibleToCompanies,
            data.jobSeekerId
        ];
        const sql = "UPDATE job_seekers SET gender = ?, birth_date = ?, location = ?, visible_to_companies = ? WHERE job_seeker_id = ?";
        this.queryDb(sql, params, callBack);
    }

    /**
    @function deleteJobSeeker
    @param {number} id - The id of the Job Seeker to be deleted.
    @param {function} callBack - The function that is called after the query is executed.
    @returns {void}
    @throws {Error} if there is an error with the query.
    @description This function is used to delete a Job Seeker from the database.
    @memberof JobSeeker
    */
    static deleteJobSeeker(id, callBack) {
        const params = [id];
        const sql = "delete from job_seekers where job_seeker_id = ? limit 1;";
        this.queryDb(sql, params, callBack);
    }
}

module.exports = JobSeeker;